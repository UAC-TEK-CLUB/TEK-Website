/** Central path builders — keep public URLs consistent across pages, emails, and revalidation. */
export const routes = {
  home: "/",
  login: "/login",
  register: (token: string) => `/register?token=${token}`,
  dashboard: "/dashboard",
  bulletin: "/bulletin",
  apply: "/apply",
  adminApplicants: "/admin/applicants",
  adminMembers: "/admin/members",
  adminLabs: "/admin/labs",
  adminProposals: "/admin/proposals",
  adminProjects: "/admin/projects",
  adminMeetings: "/admin/meetings",
  meetingsList: (siteAdmin: boolean) => (siteAdmin ? "/admin/meetings" : "/meetings"),
  meetingDetail: (meetingId: string, siteAdmin: boolean) =>
    `${routes.meetingsList(siteAdmin)}/${meetingId}`,
  lab: (labId: string) => `/labs/${labId}`,
  labConsole: (labId: string) => `/labs/${labId}/console`,
  adminLab: (labId: string) => `/admin/labs/${labId}`,
  labs: "/labs",
};
