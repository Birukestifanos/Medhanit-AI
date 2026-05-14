import StaffDashboard from "./hero/page";
import PatientsPage from "./patients/page";
import SchedulePage from "./schedule/page";
import AlertsPage from "./alerts/page";
import FeedbackPage from "./feedback/page";
import HistoryPage from "./history/page";

export default function Home() {
  return (
    <div>
      <StaffDashboard />
      <HistoryPage />
      <PatientsPage />
      <SchedulePage />
      <AlertsPage />
      <FeedbackPage />
    </div>
  );
}