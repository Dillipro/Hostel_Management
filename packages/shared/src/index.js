const Roles = {
  admin: 'admin',
  warden: 'warden',
  rc: 'rc',
  staff: 'staff',
  student: 'student',
  parent: 'parent',
};

const Permissions = {
  ManageHostel: 'manage:hostel',
  ManagePayments: 'manage:payments',
  ViewAnalytics: 'view:analytics',
  ManageComplaints: 'manage:complaints',
  ManageAttendance: 'manage:attendance',
  PublishCirculars: 'publish:circulars',
  SubmitApplications: 'submit:applications',
};

module.exports = { Roles, Permissions };
