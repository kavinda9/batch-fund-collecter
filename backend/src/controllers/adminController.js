import store from "../services/adminDashboardStore.js";

const validateRequired = (fields, body) => {
  const missingFields = fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });

  if (missingFields.length > 0) {
    return missingFields;
  }

  return null;
};

const getDashboard = async (req, res) => {
  const snapshot = await store.getDashboardSnapshot();

  res.status(200).json({
    success: true,
    message: 'Admin dashboard loaded',
    ...snapshot
  });
};

const getStudents = async (req, res) => {
  const students = await store.getStudents();

  res.status(200).json({
    success: true,
    students
  });
};

const addStudentPayment = async (req, res) => {
  const missingFields = validateRequired(['studentName', 'rollNo', 'amount'], req.body);

  if (missingFields) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }

  const student = await store.createStudentPayment(req.body);

  return res.status(201).json({
    success: true,
    message: 'Student payment recorded',
    student
  });
};

const deleteStudentRecord = async (req, res) => {
  const removed = await store.deleteStudent(req.params.id);

  if (!removed) {
    return res.status(404).json({
      success: false,
      message: 'Student record not found'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Student record deleted',
    student: removed
  });
};

const getExpenses = async (req, res) => {
  const expenses = await store.getExpenses();

  res.status(200).json({
    success: true,
    expenses
  });
};

const addExpense = async (req, res) => {
  const missingFields = validateRequired(['itemName', 'amount', 'date', 'category', 'spentBy'], req.body);

  if (missingFields) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }

  const expense = await store.createExpense(req.body);

  return res.status(201).json({
    success: true,
    message: 'Expense recorded',
    expense
  });
};

const deleteExpenseRecord = async (req, res) => {
  const removed = await store.deleteExpense(req.params.id);

  if (!removed) {
    return res.status(404).json({
      success: false,
      message: 'Expense record not found'
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Expense record deleted',
    expense: removed
  });
};

const getEvents = async (req, res) => {
  const events = await store.getEvents();

  res.status(200).json({
    success: true,
    events
  });
};

const addEvent = async (req, res) => {
  const missingFields = validateRequired(['eventTitle', 'date', 'contributionAmount', 'venue'], req.body);

  if (missingFields) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }

  const event = await store.createEvent(req.body);

  return res.status(201).json({
    success: true,
    message: 'Event created',
    event
  });
};

const getIncomeRecords = async (req, res) => {
  const incomeRecords = await store.getIncomeRecords();

  res.status(200).json({
    success: true,
    incomeRecords
  });
};

const getActivities = async (req, res) => {
  const activities = await store.getActivities();

  res.status(200).json({
    success: true,
    activities
  });
};

const getSettings = async (req, res) => {
  const settings = await store.getSettings();

  res.status(200).json({
    success: true,
    settings
  });
};

const updateSettings = async (req, res) => {
  const settings = await store.updateSettings(req.body);

  res.status(200).json({
    success: true,
    message: 'Settings updated',
    settings
  });
};

export default {
  getDashboard,
  getStudents,
  addStudentPayment,
  deleteStudentRecord,
  getExpenses,
  addExpense,
  deleteExpenseRecord,
  getEvents,
  addEvent,
  getIncomeRecords,
  getActivities,
  getSettings,
  updateSettings
};