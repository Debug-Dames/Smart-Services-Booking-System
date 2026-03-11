import * as adminService from "./admin.service.js";

export const getUsers = async (req, res) => adminService.getUsers(req, res);

export const getServices = async (req, res) => adminService.getServices(req, res);

export const createService = async (req, res) => adminService.createService(req, res);

export const updateService = async (req, res) => adminService.updateService(req, res);

export const deleteService = async (req, res) => adminService.deleteService(req, res);

