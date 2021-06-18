import React, { useEffect, useState } from "react";
import Modal from "react-modal";

import userService from "../services/user.service";

const customStyles = {
  content: {
    position: "relative",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "rgb(15, 15, 15)",
    padding: "1rem",
    borderRadius: "5px",
    boxShadow: "0 3rem 5rem rgba(0, 0, 0, 0.3)",
    textAlign: "center",
    width: "50%",
    height: "80%",

    background: "#2D2D2D",
    maxHeight: "60vh !important",
    maxWidth: "80%",
  },
};

Modal.setAppElement("#root");

export default function ViewList(props) {
  const [modalIsOpen, setIsOpen] = useState(false);

  const [listName, setListName] = useState("");
  const [finished, setFinished] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [tasks, setTasks] = useState([]);

  const [message, setMessage] = useState("");

  const { id } = props;

  function openModal() {
    setIsOpen(true);
    document.getElementById("root").style.filter = "blur(5px)";
  }

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
  }

  function closeModal() {
    setIsOpen(false);
    document.getElementById("root").style.filter = "blur(0px)";
  }

  const handleAddTask = (event) => {
    event.preventDefault();

    const newTask = {
      name: taskName,
      isDone: finished,
    };

    setTasks((prevState) => [...prevState, newTask]);
    setTaskName("");
    setFinished(false);
  };

  const removeTask = (index) => {
    const newList = tasks.filter((_, idx) => {
      return idx !== index;
    });
    setTasks([...newList]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!listName) {
      setMessage("Please enter the name of the list");
      return;
    }

    userService.updateList(id, listName, tasks).then(
      (response) => {
        props.refreshList();
        closeModal();
      },
      (err) => {
        console.error(err);
        setMessage("Something went wrong :(");
      }
    );
  };

  useEffect(() => {
    userService.getList(id).then(
      (response) => {
        setListName(response.data.name);
        setTasks([...response.data.task]);
      },
      (err) => {
        console.error(err);
      }
    );
  }, [id]);

  return (
    <>
      <button id="modal" onClick={openModal}></button>
      <Modal
        isOpen={modalIsOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
      >
        <div>
          <input
            type="text"
            placeholder="List name"
            onChange={(e) => setListName(e.target.value)}
            value={listName}
            required
          />
          <hr />
          {tasks.length > 0
            ? tasks.map((task, index) => {
                return (
                  <div key={index}>
                    <form>
                      <input
                        type="checkbox"
                        id="finished"
                        onChange={() => (task.isDone = !task.isDone)}
                        defaultChecked={task.isDone}
                      />
                      <input
                        type="text"
                        placeholder="Task name"
                        onChange={(e) => (task.name = e.target.value)}
                        defaultValue={task.name}
                      />
                    </form>
                    <button onClick={() => removeTask(index)}>
                      REMOVE TASK
                    </button>
                  </div>
                );
              })
            : ""}
          <form onSubmit={handleAddTask}>
            <input
              type="checkbox"
              id="finished"
              value={finished}
              onChange={(e) => setFinished(e.target.checked)}
              checked={finished}
            />
            <input
              type="text"
              placeholder="Task name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
            />
            <input type="submit" value="ADD" />
          </form>
          {message ? <p>{message}</p> : ""}
          <button id="cancel" onClick={() => closeModal()}>
            CANCEL
          </button>
          <button id="save" onClick={handleSubmit}>
            SAVE
          </button>
        </div>
      </Modal>
    </>
  );
}
