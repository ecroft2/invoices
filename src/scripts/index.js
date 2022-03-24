import _ from "lodash";
import "/src/styles/base.css";
import "/favicon-16x16.png";
import "/favicon-32x32.png";
import "/favicon.ico";
import "/android-chrome-192x192.png";
import "/android-chrome-512x512.png";
import "/apple-touch-icon.png";

import Controller from "./modules/controllers/controller.js";
import Model from "./modules/models/model.js";
import View from "./modules/views/view.js";

const App = new Controller(new Model(), new View());
