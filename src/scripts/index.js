import Controller from "./modules/controllers/controller.js";
import Model from "./modules/models/model.js";
import View from "./modules/views/view.js";

const App = new Controller(new Model(), new View());
