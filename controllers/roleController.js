const Role = require("../models/Role");
const { validationResult } = require("express-validator");
const { formatRoleId } = require("../utils/helpers");
const { ObjectId } = require("mongodb");

const createRole = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  const { roleName } = req.body;
  try {
    const existingRole = await Role.findOne({ roleName });

    if (existingRole) {
      return res.status(409).json({
        responseCode: 409,
        responseMessage: "Role with the same name already exists",
      });
    }

    const slug = roleName.toLowerCase().replace(/\s+/g, "-");

    const newRole = await Role.create({
      slug,
      roleName,
    });
    if (newRole) {
      return res.status(201).json({
        responseMessage: "Role created successfully",
        responseCode: 201,
        data: {
          id: newRole._id,
          slug: newRole.slug,
          roleName: newRole.roleName,
        },
      });
    } else {
      return res.status(400).send({
        responseMessage: "Role creation failed.",
        responseCode: 400,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ responseCode: 500, responseMessage: `${error.message}` });
  }
};

const editRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }
    const { roleId } = req.body;
    const roledb = await Role.findOne({ _id:roleId });
    if (!roledb) {
      return res.status(404).json({
        responseMessage: "Record not found",
        responseCode: 404,
      });
    } else {
      return res.status(200).json({
        responseMessage: "Record Found",
        responseCode: 200,
        data: {
          roleId: roledb.roleId,
          roleName: roledb.roleName
        },
      });
    }
  } catch (error) {
    res.status(400).json({ responseCode: 400, responseMessage: error.message });
  }
};

const updateRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ responseCode: 400, responseMessage: errors.array() });
  }

  try {
    const { roleId, roleName } = req.body;
    // console.log(req.body);
    const slug = roleName.toLowerCase().replace(/\s+/g, "-");

    const roleData = { roleName, slug };
    const updatedrole = await Role.findOneAndUpdate({ _id:roleId }, roleData, {
      new: true,
    });
    if (!updatedrole) {
      return res
        .status(404)
        .json({ responseCode: 404, responseMessage: "role not found" });
    }
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "role updated successfully",
      role: {
        roleId: updatedrole.roleId,
        roleName: updatedrole.roleName
      }
    });
  } catch (error) {
    // Handle any errors that occur during the update process
    console.error("Error updating user:", error);
    if (error.name === "MongoError" && error.code === 11000) {
      return res.status(400).json({
        responseCode: 400,
        responseMessage: "Duplicate email address",
      });
    }

    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: "Invalid user ID" });
    }

    // Handle database connection errors
    console.error("Database connection error:", error);
    return res.status(500).json({
      responseCode: 500,
      responseMessage: "Database connection error",
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ responseCode: 400, responseMessage: errors.array() });
    }

    const { roleId } = req.body;
    const id = new ObjectId(roleId);
    const role = await Role.findById({ _id:id });
    if (!role) {
      return res
        .status(404)
        .json({ responseCode: 404, responseMessage: "Role not found" });
    }

    // Delete the user
    // await User.findByIdAndDelete({ roleId });
    await Role.findByIdAndDelete({ _id:id });

    // Respond with a success message
    return res.status(200).json({
      responseCode: 200,
      responseMessage: "Role deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ responseCode: 500, responseMessage: error.message });
  }
};

const fetchRole = async (req, res) => { 
  try {
    // const users = await User.find();
    const roles = await Role.find().select("slug roleName createdAt");
    res.json(roles);
  } catch (error) {
    res.status(500).json({ responseMessage: error.message });
  }
}
module.exports = {
  createRole,
  editRole,
  updateRole,
  deleteRole,
  fetchRole
};
