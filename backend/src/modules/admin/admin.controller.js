import * as adminService from "./admin.service.js";

export const getUsers = async (req, res) => adminService.getUsers(req, res);
export const getBookings = async (req, res) => adminService.getBookings(req, res);
export const createUser = async (req, res) => adminService.createUser(req, res);
export const updateUser = async (req, res) => adminService.updateUser(req, res);
export const deleteUser = async (req, res) => adminService.deleteUser(req, res);
export const getStylists = async (req, res) => adminService.getStylists(req, res);
export const createStylist = async (req, res) => adminService.createStylist(req, res);
export const updateStylist = async (req, res) => adminService.updateStylist(req, res);
export const deleteStylist = async (req, res) => adminService.deleteStylist(req, res);

export const getServices = async (req, res) => adminService.getServices(req, res);

export const createService = async (req, res) => adminService.createService(req, res);

export const updateService = async (req, res) => adminService.updateService(req, res);

export const deleteService = async (req, res) => adminService.deleteService(req, res);
