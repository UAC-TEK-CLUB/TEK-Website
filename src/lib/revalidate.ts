import { revalidatePath } from "next/cache";
import { routes } from "@/lib/routes";

export function revalidateMeeting(meetingId: string, options?: { includeDashboard?: boolean }) {
  revalidatePath(routes.meetingsList(false));
  revalidatePath(routes.meetingsList(true));
  revalidatePath(routes.meetingDetail(meetingId, false));
  revalidatePath(routes.meetingDetail(meetingId, true));
  if (options?.includeDashboard !== false) {
    revalidatePath(routes.dashboard);
  }
}

export function revalidateMeetingAttendance(meetingId: string) {
  revalidatePath(routes.meetingDetail(meetingId, false));
  revalidatePath(routes.meetingDetail(meetingId, true));
}

export function revalidateLab(labId: string) {
  revalidatePath(routes.adminLabs);
  revalidatePath(routes.adminLab(labId));
  revalidatePath(routes.labConsole(labId));
  revalidatePath(routes.lab(labId));
}

export function revalidateBulletin(labId?: string | null) {
  revalidatePath(routes.bulletin);
  revalidatePath(routes.home);
  revalidatePath(routes.dashboard);
  if (labId) {
    revalidatePath(routes.lab(labId));
    revalidatePath(routes.labConsole(labId));
  }
}

export function revalidateSpotlight(labId: string) {
  revalidatePath(routes.home);
  revalidatePath(routes.lab(labId));
  revalidatePath(routes.labConsole(labId));
  revalidatePath(routes.adminLab(labId));
  revalidatePath(routes.adminLabs);
  revalidatePath(routes.adminProjects);
}

export function revalidateLabsIndex() {
  revalidatePath(routes.labs);
  revalidatePath(routes.adminLabs);
}

export function revalidateApplicants() {
  revalidatePath(routes.adminApplicants);
}

export function revalidateMembers() {
  revalidatePath(routes.adminMembers);
  revalidatePath(routes.dashboard);
}
