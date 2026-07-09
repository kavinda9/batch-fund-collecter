import admin, { canUseFirestore } from "../config/firebase.js";

const createDate = (dateString) => new Date(dateString).toISOString().slice(0, 10);

const initialState = {
  students: [
    { id: 1, name: 'Rahul Verma', roll: '22BCS108', amountPaid: 3000, dues: 0, status: 'Paid', date: '2026-06-15' },
    { id: 2, name: 'Amit Kumar', roll: '22BCS012', amountPaid: 3000, dues: 0, status: 'Paid', date: '2026-06-20' },
    { id: 3, name: 'Priyanshu Sharma', roll: '22BCS015', amountPaid: 1500, dues: 1500, status: 'Partially Paid', date: '2026-05-10' },
    { id: 4, name: 'Sneha Patel', roll: '22BCS144', amountPaid: 3000, dues: 0, status: 'Paid', date: '2026-06-28' },
    { id: 5, name: 'Divya Teja', roll: '22BCS041', amountPaid: 0, dues: 3000, status: 'Unpaid', date: '-' },
    { id: 6, name: 'Rohan Das', roll: '22BCS092', amountPaid: 3000, dues: 0, status: 'Paid', date: '2026-06-14' },
    { id: 7, name: 'Anjali Gupta', roll: '22BCS021', amountPaid: 3000, dues: 0, status: 'Paid', date: '2026-06-19' },
    { id: 8, name: 'Tarun Sen', roll: '22BCS120', amountPaid: 1500, dues: 1500, status: 'Partially Paid', date: '2026-05-25' }
  ],
  expenses: [
    { id: 1, item: 'Farewell DJ Booking', amount: 12000, date: '2026-06-25', category: 'Events', spentBy: 'Farewell Committee', desc: 'Downpayment for Sound system & DJ setup.' },
    { id: 2, item: 'Lab Journal Printing', amount: 4500, date: '2026-06-18', category: 'Supplies', spentBy: 'Rohan Das', desc: 'Coordinated printing for 60 lab copies.' },
    { id: 3, item: 'Charity Food Drive', amount: 8000, date: '2026-06-05', category: 'Charity', spentBy: 'Sneha Patel', desc: 'Bought grains & meals for local orphanage.' },
    { id: 4, item: 'Dean Meeting Caterers', amount: 2500, date: '2026-05-28', category: 'Others', spentBy: 'Prof. Sharma', desc: 'Refreshments for syllabus review meeting.' }
  ],
  events: [
    { id: 1, title: 'Farewell Gala 2026', date: '2026-07-15', dues: 500, venue: 'Main Auditorium', rsvp: 58, desc: 'Farewell celebration for outgoing seniors.' },
    { id: 2, title: 'Batch Project Exhibition', date: '2026-07-28', dues: 0, venue: 'CSE Lab 2 & 3', rsvp: 45, desc: 'Showcase of mini projects to faculty panels.' }
  ],
  activities: [
    { id: 1, type: 'payment', text: 'Sneha Patel paid Rs. 1,500 for Monthly Contribution', time: 'June 28, 2026' },
    { id: 2, type: 'expense', text: 'Recorded expense: Rs. 12,000 for Farewell DJ Booking', time: 'June 25, 2026' },
    { id: 3, type: 'payment', text: 'Amit Kumar paid Rs. 1,500 for Monthly Contribution', time: 'June 20, 2026' },
    { id: 4, type: 'expense', text: 'Recorded expense: Rs. 4,500 for Lab Journal Printing', time: 'June 18, 2026' },
    { id: 5, type: 'payment', text: 'Rahul Verma paid Rs. 1,500 for Monthly Contribution', time: 'June 15, 2026' }
  ],
  incomeRecords: [
    { id: 'INC102', contributor: 'Rahul Verma', roll: '22BCS108', purpose: 'Monthly Contribution', mode: 'UPI', date: '2026-06-15', amount: 3000, type: 'student' },
    { id: 'INC204', contributor: 'Amit Kumar', roll: '22BCS012', purpose: 'Monthly Contribution', mode: 'UPI', date: '2026-06-20', amount: 3000, type: 'student' },
    { id: 'INC306', contributor: 'Priyanshu Sharma', roll: '22BCS015', purpose: 'Monthly Contribution', mode: 'UPI', date: '2026-05-10', amount: 1500, type: 'student' },
    { id: 'INC408', contributor: 'Sneha Patel', roll: '22BCS144', purpose: 'Monthly Contribution', mode: 'UPI', date: '2026-06-28', amount: 3000, type: 'student' },
    { id: 'INC510', contributor: 'Divya Teja', roll: '22BCS041', purpose: 'Monthly Contribution', mode: 'UPI', date: '-', amount: 0, type: 'student' },
    { id: 'INC612', contributor: 'Rohan Das', roll: '22BCS092', purpose: 'Monthly Contribution', mode: 'UPI', date: '2026-06-14', amount: 3000, type: 'student' },
    { id: 'INC714', contributor: 'Anjali Gupta', roll: '22BCS021', purpose: 'Monthly Contribution', mode: 'UPI', date: '2026-06-19', amount: 3000, type: 'student' },
    { id: 'INC816', contributor: 'Tarun Sen', roll: '22BCS120', purpose: 'Monthly Contribution', mode: 'UPI', date: '2026-05-25', amount: 1500, type: 'student' },
    { id: 'INC-EXT-1', contributor: 'CSE Department Office', roll: '-', purpose: 'Exhibition Sponsorship', mode: 'Bank Transfer', date: '2026-06-10', amount: 15000, type: 'external' }
  ],
  settings: {
    academicYear: '2025-2026',
    batchSizeLimit: 68,
    monthlyContribution: 500,
    monthlyDueDate: 10,
    remindersEnabled: true,
    receiptUploadsEnabled: true
  }
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const nextId = (items) => items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
const normalizeId = (id) => {
  const numericId = Number(id);
  return Number.isFinite(numericId) && String(numericId) === String(id) ? numericId : id;
};

const collectionNames = {
  students: 'admin_students',
  expenses: 'admin_expenses',
  events: 'admin_events',
  activities: 'admin_activities',
  incomeRecords: 'admin_income_records',
  settings: 'admin_settings'
};

const settingsDocId = 'current';
const state = clone(initialState);
const firestoreEnabled = canUseFirestore() && process.env.NODE_ENV !== 'test';
const firestore = firestoreEnabled ? admin.firestore() : null;
let initPromise = null;

const sortByCreatedAtDesc = (left, right) => {
  const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
  const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;

  if (rightTime !== leftTime) {
    return rightTime - leftTime;
  }

  return String(right.id).localeCompare(String(left.id));
};

const writeCollection = async (collectionName, items) => {
  const batch = firestore.batch();

  items.forEach((item) => {
    batch.set(firestore.collection(collectionName).doc(String(item.id)), {
      ...clone(item),
      createdAt: item.createdAt || new Date().toISOString()
    });
  });

  await batch.commit();
};

const readCollection = async (collectionName, seedItems) => {
  const snapshot = await firestore.collection(collectionName).get();

  if (snapshot.empty) {
    await writeCollection(collectionName, seedItems);
    return clone(seedItems);
  }

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: data.id ?? normalizeId(doc.id)
      };
    })
    .sort(sortByCreatedAtDesc);
};

const readSettings = async () => {
  const docSnapshot = await firestore.collection(collectionNames.settings).doc(settingsDocId).get();

  if (!docSnapshot.exists) {
    await firestore.collection(collectionNames.settings).doc(settingsDocId).set({
      ...clone(state.settings),
      createdAt: new Date().toISOString()
    });

    return clone(state.settings);
  }

  return docSnapshot.data();
};

const ensureReady = async () => {
  if (!firestore) {
    return;
  }

  if (!initPromise) {
    initPromise = (async () => {
      const [students, expenses, events, activities, incomeRecords, settings] = await Promise.all([
        readCollection(collectionNames.students, state.students),
        readCollection(collectionNames.expenses, state.expenses),
        readCollection(collectionNames.events, state.events),
        readCollection(collectionNames.activities, state.activities),
        readCollection(collectionNames.incomeRecords, state.incomeRecords),
        readSettings()
      ]);

      state.students = students;
      state.expenses = expenses;
      state.events = events;
      state.activities = activities;
      state.incomeRecords = incomeRecords;
      state.settings = settings;
    })();
  }

  await initPromise;
};

const calculateSummary = () => {
  const totalIncome = state.incomeRecords.reduce((sum, record) => sum + Number(record.amount || 0), 0);
  const totalExpenses = state.expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const pendingContributions = state.students.filter((student) => student.status !== 'Paid').length;
  const upcomingEvents = state.events.filter((event) => event.date >= createDate(new Date().toISOString()));

  return {
    totalBalance: totalIncome - totalExpenses,
    totalIncome,
    totalExpenses,
    pendingContributions,
    totalStudents: state.students.length,
    upcomingEventsCount: upcomingEvents.length,
    academicYearTarget: 240000,
    collectionTargetProgress: Math.round((totalIncome / 240000) * 100)
  };
};

const appendActivity = async (activity) => {
  const entry = {
    ...activity,
    id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString()
  };

  state.activities.unshift(entry);

  if (firestore) {
    await firestore.collection(collectionNames.activities).doc(String(entry.id)).set(entry);
  }

  return clone(entry);
};

const createStudentPayment = async ({ studentName, rollNo, amount, date, purpose, paymentMode = 'UPI' }) => {
  await ensureReady();

  const normalizedAmount = Number(amount);
  const paymentDate = date || createDate(new Date());
  const student = {
    id: nextId(state.students),
    name: studentName,
    roll: rollNo,
    amountPaid: normalizedAmount,
    dues: Math.max(0, 3000 - normalizedAmount),
    status: normalizedAmount >= 3000 ? 'Paid' : 'Partially Paid',
    date: paymentDate,
    createdAt: new Date().toISOString()
  };

  const incomeRecord = {
    id: `INC${Date.now()}`,
    contributor: studentName,
    roll: rollNo,
    purpose: purpose || 'Monthly Contribution',
    mode: paymentMode,
    date: paymentDate,
    amount: normalizedAmount,
    type: 'student',
    createdAt: new Date().toISOString()
  };

  state.students.unshift(student);
  state.incomeRecords.unshift(incomeRecord);

  if (firestore) {
    const batch = firestore.batch();
    batch.set(firestore.collection(collectionNames.students).doc(String(student.id)), clone(student));
    batch.set(firestore.collection(collectionNames.incomeRecords).doc(String(incomeRecord.id)), clone(incomeRecord));
    await batch.commit();
  }

  await appendActivity({
    type: 'payment',
    text: `${studentName} paid Rs. ${normalizedAmount.toLocaleString()} for ${purpose || 'Monthly Contribution'}`,
    time: paymentDate
  });

  return clone(student);
};

const createExpense = async ({ itemName, amount, date, category, spentBy, description }) => {
  await ensureReady();

  const expense = {
    id: nextId(state.expenses),
    item: itemName,
    amount: Number(amount),
    date: date || createDate(new Date()),
    category,
    spentBy,
    desc: description || '',
    createdAt: new Date().toISOString()
  };

  state.expenses.unshift(expense);

  if (firestore) {
    await firestore.collection(collectionNames.expenses).doc(String(expense.id)).set(clone(expense));
  }

  await appendActivity({
    type: 'expense',
    text: `Recorded expense: Rs. ${Number(amount).toLocaleString()} for ${itemName}`,
    time: expense.date
  });

  return clone(expense);
};

const createEvent = async ({ eventTitle, date, contributionAmount, venue, description }) => {
  await ensureReady();

  const event = {
    id: nextId(state.events),
    title: eventTitle,
    date: date || createDate(new Date()),
    dues: Number(contributionAmount),
    venue,
    rsvp: 0,
    desc: description || '',
    createdAt: new Date().toISOString()
  };

  state.events.unshift(event);

  if (firestore) {
    await firestore.collection(collectionNames.events).doc(String(event.id)).set(clone(event));
  }

  await appendActivity({
    type: 'event',
    text: `New event scheduled: "${eventTitle}"`,
    time: event.date
  });

  return clone(event);
};

const deleteStudent = async (id) => {
  await ensureReady();

  const studentId = Number(id);
  const removed = state.students.find((student) => student.id === studentId);
  state.students = state.students.filter((student) => student.id !== studentId);

  if (firestore && removed) {
    await firestore.collection(collectionNames.students).doc(String(studentId)).delete();
  }

  return removed ? clone(removed) : null;
};

const deleteExpense = async (id) => {
  await ensureReady();

  const expenseId = Number(id);
  const removed = state.expenses.find((expense) => expense.id === expenseId);
  state.expenses = state.expenses.filter((expense) => expense.id !== expenseId);

  if (firestore && removed) {
    await firestore.collection(collectionNames.expenses).doc(String(expenseId)).delete();
  }

  return removed ? clone(removed) : null;
};

const updateSettings = async (patch) => {
  await ensureReady();

  state.settings = {
    ...state.settings,
    ...patch
  };

  if (firestore) {
    await firestore.collection(collectionNames.settings).doc(settingsDocId).set({
      ...clone(state.settings),
      createdAt: new Date().toISOString()
    });
  }

  return clone(state.settings);
};

const getDashboardSnapshot = async () => {
  await ensureReady();

  return {
    summary: calculateSummary(),
    students: clone(state.students),
    expenses: clone(state.expenses),
    events: clone(state.events),
    activities: clone(state.activities),
    incomeRecords: clone(state.incomeRecords),
    settings: clone(state.settings)
  };
};

const getStudents = async () => {
  await ensureReady();
  return clone(state.students);
};

const getExpenses = async () => {
  await ensureReady();
  return clone(state.expenses);
};

const getEvents = async () => {
  await ensureReady();
  return clone(state.events);
};

const getIncomeRecords = async () => {
  await ensureReady();
  return clone(state.incomeRecords);
};

const getActivities = async () => {
  await ensureReady();
  return clone(state.activities);
};

const getSettings = async () => {
  await ensureReady();
  return clone(state.settings);
};

export default {
  getDashboardSnapshot,
  getStudents,
  getExpenses,
  getEvents,
  getIncomeRecords,
  getActivities,
  getSettings,
  createStudentPayment,
  createExpense,
  createEvent,
  deleteStudent,
  deleteExpense,
  updateSettings
};