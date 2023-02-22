const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed")




router.route("/:dishid")
    .get(controller.read)
    .put(controller.update)
    .all(methodNotAllowed)
///get
router.route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed)


///post

// TODO: Implement the /dishes routes needed to make the tests pass


module.exports = router;
