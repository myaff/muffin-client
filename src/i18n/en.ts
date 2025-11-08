export default {
  locale: {
    ru: 'Русский',
    en: 'English',
  },
  signin: {
    title: 'Sign in',
    alternate: {
      text: 'Don\'t have an account?',
      btn: 'Signup',
    },
  },
  signup: {
    title: 'Sign up',
    currency: 'Default currency',
    alternate: {
      text: 'Already have an account?',
      btn: 'Signin',
    },
  },
  form: {
    email: {
      label: 'Email',
    },
    password: {
      label: 'Password',
    },
    firstName: {
      label: 'First name',
    },
    lastName: {
      label: 'Last name',
    },
    middleName: {
      label: 'Middle name',
    },
    dateFrom: {
      label: 'Date from',
      prefix: 'From',
    },
    dateTo: {
      label: 'Date to',
      prefix: 'To',
    },
  },
  btn: {
    submit: 'Submit',
    ok: 'OK',
    save: 'Save',
    cancel: 'Cancel',
    reset: 'Reset',
    edit: 'Edit',
    signout: 'Sign out',
    create: 'Create',
    createOne: 'Create {msg}',
    add: 'Add',
    addOne: 'Add {msg}',
  },
  error: {
    unknown: {
      title: 'Something went wrong!',
      message: 'Please, try again later'
    },
    unrated: {
      title: 'Unrated tracking records found!',
    },
  },
  empty: 'No {msg} found',
  page: {
    home: 'Home',
    clients: 'Clients',
    projects: 'Projects',
    tasks: 'Tasks',
    tracking: 'Tracking',
    trackingTable: 'Table',
    trackingCalendar: 'Calendar',
    finance: 'Finance',
  },
  clients: {
    item: 'Client',
    items: 'Clients',
    empty: 'No clients found',
    nClients: 'No clients | 1 client | {n} clients',
    add: "Add client",
    create: 'Create client',
    update: 'Update client',
    type: {
      person: 'Person',
      company: 'Company',
    },
    fields: {
      name: 'Name',
      form: 'Form',
      type: 'Type',
    }
  },
  projects: {
    item: 'Project',
    items: 'Projects',
    empty: 'No projects found',
    nProjects: 'No projects | 1 project | {n} projects',
    add: "Add project",
    create: 'Create project',
    update: 'Update project',
    fields: {
      title: 'Title',
      url: 'Link',
      client: 'Client',
      rate: 'Rate',
    },
    active: 'Active',
    notActive: 'Not active',
    notStarted: 'Not started',
    external: 'Visit',
  },
  rates: {
    item: 'Rate',
    items: 'Rates',
    empty: 'No rates found',
    nRates: 'No rates | 1 rate | {n} rates',
    add: "Add rate",
    create: 'Create rate',
    update: 'Update rate',
    types: {
      hourly: {
        title: 'Hourly',
        per: '/h',
      },
      monthly: {
        title: 'Monthly',
        per: '/m',
      },
      fixed: {
        title: 'Fixed',
        per: ' fixed',
      },
    },
    fields: {
      currency: 'Currency',
      value: 'Link',
      type: 'Type',
      projects: 'Projects',
      dateFrom: 'Acts from',
      dateTo: 'Acts to'
    }
  },
  tasks: {
    item: 'Task',
    items: 'Tasks',
    empty: 'No tasks found',
    nTasks: 'No tasks | 1 task | {n} tasks',
    add: 'Add task',
    create: 'Create task',
    update: 'Update task',
    updateStatus: 'Update task\'s status',
    statusGroups: {
      todo: 'TODO',
      progress: 'In progress',
      approve: 'Approve',
      done: 'Done',
    },
    fields: {
      project: 'Project',
      status: 'Status',
      title: 'Title',
      url: 'URL',
      code: 'Code',
    },
    active: 'Active',
    notActive: 'Not active',
    notStarted: 'Not started',
  },
  tracking: {
    title: 'Tracking',
    item: 'Tracking',
    items: 'Trackings',
    empty: 'No tracking records found',
    nTasks: 'No tracking records | 1 tracking record | {n} tracking records',
    add: 'Add tracking record',
    create: 'Create tracking record',
    update: 'Update tracking record',
    fields: {
      task: 'Task',
      date: 'Date',
      title: 'Title',
      hours: 'Hours spended',
      hoursShort: 'Hours',
      note: 'Note',
      rate: 'Rate',
      subtotal: 'Subtotal',
    },
    total: 'Total',
    hours: '0 hours | 1 hour | {n} hours',
    saveManyError: 'Seems like not all records were saved',
  },
  groupBy: {
    task: 'Group by task',
    project: 'Group by project',
    client: 'Group by client'
  },
  summary: {
    title: 'Summary',
    total: 'Total',
    totalVariant: 'Total',
    subtotal: 'Subtotal',
    active: 'Active',
  },
  money: {
    title: 'Money',
  },
  date: {
    title: 'Date',
    range: 'Range',
    day: 'Day',
    month: 'Month',
    year: 'Year',
  },
  '10': '10',
  '25': '25',
  '50': '50',
  '100': '100',
}