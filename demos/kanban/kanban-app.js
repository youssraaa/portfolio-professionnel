import React2 from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
var React = React2;

import { Routes, Route } from "react-router-dom";

import { Outlet } from "react-router-dom";

import { Link } from "react-router-dom";
function Navbar() {
  return React.createElement("nav", { className: "navbar navbar-expand-lg navbar-dark bg-dark shadow-sm" }, React.createElement("div", { className: "container" }, React.createElement(Link, { className: "navbar-brand", to: "/" }, "Kanban"), React.createElement("div", { className: "collapse navbar-collapse" }, React.createElement("ul", { className: "navbar-nav ms-auto mb-2 mb-lg-0" }, React.createElement("li", { className: "nav-item" }, React.createElement(Link, { className: "nav-link", to: "/" }, "Tableau")), React.createElement("li", { className: "nav-item" }, React.createElement(Link, { className: "nav-link", to: "/new" }, "Nouvelle tâche"))))));
}
var Navbar_default = Navbar;

function Layout() {
  return React.createElement("div", { className: "app-layout" }, React.createElement("header", null, React.createElement(Navbar_default, null)), React.createElement("main", { className: "container mt-4" }, React.createElement(Outlet, null)));
}
var Layout_default = Layout;

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
function TaskCard({ id, title, description, status, createdAt, onDelete, onMoveLeft, onMoveRight }) {
  const navigate = useNavigate();
  return React.createElement("div", { className: "card mb-3 kanban-card" }, React.createElement("div", { className: "card-body" }, React.createElement("div", { className: "d-flex justify-content-between align-items-center mb-2" }, React.createElement("h5", { className: "card-title mb-0 text-center w-100" }, title)), description && React.createElement("p", { className: "card-text text-center" }, description), createdAt && React.createElement("p", { className: "task-date text-center mb-3" }, "Créée le ", createdAt), React.createElement("div", { className: "d-flex justify-content-between" }, React.createElement("div", null, onMoveLeft && React.createElement("button", { className: "btn btn-move me-1", onClick: onMoveLeft, title: "Déplacer à gauche" }, React.createElement("i", { className: "bi bi-arrow-left" })), onMoveRight && React.createElement("button", { className: "btn btn-move", onClick: onMoveRight, title: "Déplacer à droite" }, React.createElement("i", { className: "bi bi-arrow-right" })), React.createElement(
    "button",
    {
      className: "btn btn-view me-1",
      onClick: () => navigate(`/task/${id}`, { state: { task: { id, title, description, status, createdAt } } }),
      title: "Voir le détail"
    },
    React.createElement("i", { className: "bi bi-eye" })
  ), React.createElement(
    "button",
    {
      className: "btn btn-edit me-1",
      onClick: () => navigate(`/edit/${id}`, { state: { task: { id, title, description, status, createdAt } } }),
      title: "Modifier la tâche"
    },
    React.createElement("i", { className: "bi bi-pencil-square" })
  )), onDelete && React.createElement("button", { className: "btn btn-delete", onClick: onDelete, title: "Supprimer la tâche" }, React.createElement("i", { className: "bi bi-x-lg" })))));
}
var TaskCard_default = TaskCard;

function Column({ title, status, tasks = [], onDeleteTask, onMoveTask }) {
  return React.createElement("div", { className: "col-md-4" }, React.createElement("h4", { className: `column-title ${status}` }, title), tasks.map((t) => {
    let moveLeft = null;
    let moveRight = null;
    if (t.status !== "todo") {
      moveLeft = () => onMoveTask(t.id, -1);
    }
    if (t.status !== "done") {
      moveRight = () => onMoveTask(t.id, 1);
    }
    return React.createElement(
      TaskCard_default,
      {
        key: t.id,
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        createdAt: t.createdAt,
        onDelete: () => onDeleteTask(t.id),
        onMoveLeft: moveLeft,
        onMoveRight: moveRight
      }
    );
  }));
}
var Column_default = Column;

var TASKS_URL = "http://localhost:3001/tasks";
function Board() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  async function loadTasks() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(TASKS_URL);
      if (!response.ok) {
        throw new Error("Erreur réseau lors du chargement des tâches");
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadTasks();
  }, []);
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${TASKS_URL}/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la tâche");
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de la tâche");
    }
  };
  const handleMove = async (id, direction) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    let newStatus = task.status;
    if (direction === -1 && task.status === "doing") newStatus = "todo";
    if (direction === -1 && task.status === "done") newStatus = "doing";
    if (direction === 1 && task.status === "todo") newStatus = "doing";
    if (direction === 1 && task.status === "doing") newStatus = "done";
    if (newStatus === task.status) return;
    const updatedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: newStatus,
      createdAt: task.createdAt
    };
    try {
      const response = await fetch(`${TASKS_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask)
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut");
      }
      setTasks(
        (prev) => prev.map((t) => t.id === id ? updatedTask : t)
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors du déplacement de la tâche");
    }
  };
  const filteredTasks = tasks.filter((t) => {
    const keyword = searchTerm.toLowerCase();
    const titleMatch = t.title.toLowerCase().includes(keyword);
    const descMatch = (t.description || "").toLowerCase().includes(keyword);
    const statusMatch = statusFilter === "all" ? true : t.status === statusFilter;
    return (titleMatch || descMatch) && statusMatch;
  });
  const todo = filteredTasks.filter((t) => t.status === "todo");
  const doing = filteredTasks.filter((t) => t.status === "doing");
  const done = filteredTasks.filter((t) => t.status === "done");
  if (loading) {
    return React.createElement("p", { className: "m-3" }, "Chargement des tâches...");
  }
  if (error) {
    return React.createElement("p", { className: "m-3 text-danger" }, "Erreur : ", error);
  }
  return React.createElement("div", { className: "container mt-4" }, React.createElement("div", { className: "row mb-4" }, React.createElement("div", { className: "col-md-8" }, React.createElement(
    "input",
    {
      type: "text",
      className: "form-control",
      placeholder: "Rechercher une tâche...",
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value)
    }
  )), React.createElement("div", { className: "col-md-4 mt-2 mt-md-0" }, React.createElement(
    "select",
    {
      className: "form-select",
      value: statusFilter,
      onChange: (e) => setStatusFilter(e.target.value)
    },
    React.createElement("option", { value: "all" }, "Tous les statuts"),
    React.createElement("option", { value: "todo" }, "À faire"),
    React.createElement("option", { value: "doing" }, "En cours"),
    React.createElement("option", { value: "done" }, "Terminé")
  ))), React.createElement("div", { className: "row g-4" }, React.createElement(Column_default, { title: "À faire", status: "todo", tasks: todo, onDeleteTask: handleDelete, onMoveTask: handleMove }), React.createElement(Column_default, { title: "En cours", status: "doing", tasks: doing, onDeleteTask: handleDelete, onMoveTask: handleMove }), React.createElement(Column_default, { title: "Terminé", status: "done", tasks: done, onDeleteTask: handleDelete, onMoveTask: handleMove })));
}
var Board_default = Board;

function Home() {
  return React.createElement("div", { className: "main-container" }, React.createElement("h2", { className: "page-title" }, "Tableau Kanban"), React.createElement(Board_default, null));
}
var Home_default = Home;

import { useLocation, useParams, Link as Link2 } from "react-router-dom";
function TaskDetail() {
  const { id } = useParams();
  const location = useLocation();
  const task = location.state?.task;
  if (!task) {
    return React.createElement("div", { className: "container text-center mt-5" }, React.createElement("h2", { className: "mb-3" }, "Détail de la tâche"), React.createElement("p", { className: "text-danger" }, "Tâche introuvable (id : ", id, ")."), React.createElement(Link2, { to: "/", className: "btn-back" }, "Retour au tableau"));
  }
  return React.createElement("div", { className: "container text-center mt-5" }, React.createElement("h2", { className: "mb-4" }, "Détail de la tâche"), React.createElement("div", { className: `task-detail-card status-${task.status}` }, React.createElement("h3", { className: "card-title" }, task.title), task.description && React.createElement("p", { className: "card-text" }, task.description), React.createElement("p", { className: "mb-1" }, React.createElement("strong", null, "Statut :"), " ", task.status === "todo" && "À faire", task.status === "doing" && "En cours", task.status === "done" && "Terminé"), task.createdAt && React.createElement("p", { className: "mb-3" }, React.createElement("strong", null, "Créée le :"), " ", task.createdAt), React.createElement(Link2, { to: "/", className: "btn btn-secondary" }, "Retour au tableau")));
}
var TaskDetail_default = TaskDetail;

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate as useNavigate2 } from "react-router-dom";
var TASKS_URL2 = "http://localhost:3001/tasks";
var schema = Yup.object({
  title: Yup.string().required("Titre obligatoire").min(3, "Au moins 3 caractères"),
  description: Yup.string().max(200, "200 caractères max"),
  status: Yup.string().oneOf(["todo", "doing", "done"]).required()
});
function NewTask() {
  const navigate = useNavigate2();
  return React.createElement("div", { className: "main-container" }, React.createElement("h2", { className: "page-title" }, "Nouvelle tâche"), React.createElement(
    Formik,
    {
      initialValues: { title: "", description: "", status: "todo" },
      validationSchema: schema,
      onSubmit: async (values, { setSubmitting, resetForm }) => {
        try {
          const now = new Date();
          const newTask = {
            title: values.title,
            description: values.description,
            status: values.status,
            createdAt: now.toLocaleDateString("fr-FR")
          };
          const response = await fetch(TASKS_URL2, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTask)
          });
          if (!response.ok) {
            throw new Error("Erreur lors de la création de la tâche");
          }
          resetForm();
          navigate("/");
        } catch (err) {
          console.error(err);
          alert("Erreur lors de la création de la tâche");
        } finally {
          setSubmitting(false);
        }
      }
    },
    React.createElement(Form, null, React.createElement("div", { className: "mb-3" }, React.createElement("label", { className: "form-label" }, "Titre"), React.createElement(Field, { name: "title", className: "form-control" }), React.createElement("div", { className: "text-danger" }, React.createElement(ErrorMessage, { name: "title" }))), React.createElement("div", { className: "mb-3" }, React.createElement("label", { className: "form-label" }, "Description"), React.createElement(Field, { as: "textarea", name: "description", className: "form-control", rows: "3" }), React.createElement("div", { className: "text-danger" }, React.createElement(ErrorMessage, { name: "description" }))), React.createElement("div", { className: "mb-3" }, React.createElement("label", { className: "form-label" }, "Statut"), React.createElement(Field, { as: "select", name: "status", className: "form-select" }, React.createElement("option", { value: "todo" }, "À faire"), React.createElement("option", { value: "doing" }, "En cours"), React.createElement("option", { value: "done" }, "Terminé")), React.createElement("div", { className: "text-danger" }, React.createElement(ErrorMessage, { name: "status" }))), React.createElement("button", { type: "submit", className: "btn btn-primary" }, "Créer"))
  ));
}
var NewTask_default = NewTask;

import { useNavigate as useNavigate3, useLocation as useLocation2 } from "react-router-dom";
import { Formik as Formik2, Form as Form2, Field as Field2, ErrorMessage as ErrorMessage2 } from "formik";
import * as Yup2 from "yup";
var TASKS_URL3 = "http://localhost:3001/tasks";
var schema2 = Yup2.object({
  title: Yup2.string().required("Le titre est obligatoire").min(3, "Au moins 3 caractères"),
  description: Yup2.string().max(200, "200 caractères maximum"),
  status: Yup2.string().oneOf(["todo", "doing", "done"]).required("Le statut est obligatoire")
});
function EditTask() {
  const navigate = useNavigate3();
  const location = useLocation2();
  const taskToEdit = location.state?.task;
  if (!taskToEdit) {
    return React.createElement("p", { className: "m-3 text-danger" }, "Tâche introuvable.");
  }
  return React.createElement("div", { className: "container" }, React.createElement("h2", { className: "mb-3" }, "Modifier la tâche"), React.createElement(
    Formik2,
    {
      initialValues: {
        title: taskToEdit.title,
        description: taskToEdit.description,
        status: taskToEdit.status
      },
      validationSchema: schema2,
      onSubmit: async (values, { setSubmitting }) => {
        try {
          const updatedTask = {
            id: taskToEdit.id,
            title: values.title,
            description: values.description,
            status: values.status,
            createdAt: taskToEdit.createdAt
          };
          const response = await fetch(`${TASKS_URL3}/${taskToEdit.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTask)
          });
          if (!response.ok) {
            throw new Error("Erreur lors de la mise à jour de la tâche");
          }
          navigate("/");
        } catch (err) {
          console.error(err);
          alert("Erreur lors de la mise à jour de la tâche");
        } finally {
          setSubmitting(false);
        }
      }
    },
    React.createElement(Form2, null, React.createElement("div", { className: "mb-3" }, React.createElement("label", { className: "form-label" }, "Titre"), React.createElement(Field2, { name: "title", className: "form-control" }), React.createElement("div", { className: "text-danger" }, React.createElement(ErrorMessage2, { name: "title" }))), React.createElement("div", { className: "mb-3" }, React.createElement("label", { className: "form-label" }, "Description"), React.createElement(Field2, { as: "textarea", name: "description", className: "form-control", rows: "3" }), React.createElement("div", { className: "text-danger" }, React.createElement(ErrorMessage2, { name: "description" }))), React.createElement("div", { className: "mb-3" }, React.createElement("label", { className: "form-label" }, "Statut"), React.createElement(Field2, { as: "select", name: "status", className: "form-select" }, React.createElement("option", { value: "todo" }, "À faire"), React.createElement("option", { value: "doing" }, "En cours"), React.createElement("option", { value: "done" }, "Terminé")), React.createElement("div", { className: "text-danger" }, React.createElement(ErrorMessage2, { name: "status" }))), React.createElement("button", { type: "submit", className: "btn btn-primary" }, "Mettre à jour"))
  ));
}
var EditTask_default = EditTask;

function NotFound() {
  return React.createElement("div", null, React.createElement("h2", null, "404 — Page introuvable"));
}
var NotFound_default = NotFound;

function App() {
  return React.createElement(Routes, null, React.createElement(Route, { element: React.createElement(Layout_default, null) }, React.createElement(Route, { path: "/", element: React.createElement(Home_default, null) }), React.createElement(Route, { path: "/task/:id", element: React.createElement(TaskDetail_default, null) }), React.createElement(Route, { path: "/new", element: React.createElement(NewTask_default, null) }), React.createElement(Route, { path: "/edit/:id", element: React.createElement(EditTask_default, null) }), React.createElement(Route, { path: "*", element: React.createElement(NotFound_default, null) })));
}
var App_default = App;

var originalFetch = window.fetch;
window.fetch = async function(url, options) {
  const urlStr = String(url);
  if (urlStr.includes("3001/tasks") || urlStr.endsWith("/tasks") || urlStr.includes("/tasks/")) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 400);
      const res = await originalFetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) return res;
    } catch (e) {
    }
    let stored = localStorage.getItem("youssra_kanban_tasks");
    let tasks = [];
    if (!stored) {
      const initialDb = await (await originalFetch("db.json")).json();
      tasks = initialDb.tasks || [];
      localStorage.setItem("youssra_kanban_tasks", JSON.stringify(tasks));
    } else {
      tasks = JSON.parse(stored);
    }
    const method = (options?.method || "GET").toUpperCase();
    if (method === "GET" && !urlStr.match(/tasks\/\w+/)) {
      return new Response(JSON.stringify(tasks), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const matchGet = urlStr.match(/tasks\/(\w+)/);
    if (method === "GET" && matchGet) {
      const id = matchGet[1];
      const task = tasks.find((t) => String(t.id) === String(id));
      if (task) {
        return new Response(JSON.stringify(task), { status: 200, headers: { "Content-Type": "application/json" } });
      } else {
        return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
      }
    }
    if (method === "POST") {
      const newTask = JSON.parse(options.body);
      newTask.id = String(Date.now());
      tasks.push(newTask);
      localStorage.setItem("youssra_kanban_tasks", JSON.stringify(tasks));
      return new Response(JSON.stringify(newTask), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (method === "PUT") {
      const matchPut = urlStr.match(/tasks\/(\w+)/);
      if (matchPut) {
        const id = matchPut[1];
        const updated = JSON.parse(options.body);
        tasks = tasks.map((t) => String(t.id) === String(id) ? { ...t, ...updated } : t);
        localStorage.setItem("youssra_kanban_tasks", JSON.stringify(tasks));
        return new Response(JSON.stringify(updated), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
    if (method === "DELETE") {
      const matchDel = urlStr.match(/tasks\/(\w+)/);
      if (matchDel) {
        const id = matchDel[1];
        tasks = tasks.filter((t) => String(t.id) !== String(id));
        localStorage.setItem("youssra_kanban_tasks", JSON.stringify(tasks));
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
  }
  return originalFetch(url, options);
};
var root = createRoot(document.getElementById("root"));
root.render(
  React2.createElement(React2.StrictMode, null, React2.createElement(HashRouter, null, React2.createElement(App_default, null)))
);
