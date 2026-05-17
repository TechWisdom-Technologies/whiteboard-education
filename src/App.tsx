import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Universities from "./pages/Universities";
import Universities2 from "./pages/Universities2";
import CoursesPage from "./pages/Courses";
import Courses2 from "./pages/Courses2";
import CourseDetail from "./pages/CourseDetail";
import StudyInMalaysia from "./pages/StudyInMalaysia";
import CityHub from "./pages/CityHub";
import UniversityDetail from "./pages/UniversityDetail";
import EligibilityWizard from "./pages/EligibilityWizard";
import B2BLanding from "./pages/B2BLanding";
import CostCalculator from "./pages/CostCalculator";
import GpaConverter from "./pages/GpaConverter";
import Compare from "./pages/Compare";
import Application from "./pages/Application";

import VisaGuide from "./pages/VisaGuide";
import Housing from "./pages/Housing";
import LanguagePrep from "./pages/LanguagePrep";
import Blog from "./pages/Blog";
import BlogPostPage from "./pages/BlogPost";
import LanguageCentersPage from "./pages/LanguageCenters";
import LanguageCenterDetail from "./pages/LanguageCenterDetail";
import Alumni from "./pages/Alumni";
import PreDeparture from "./pages/PreDeparture";
import HelpCenter from "./pages/HelpCenter";
import ComingSoon from "./pages/ComingSoon";
import Contact from "./pages/Contact";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUniversities from "./pages/admin/AdminUniversities";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminAccommodations from "./pages/admin/AdminAccommodations";
import AdminLanguageCenters from "./pages/admin/AdminLanguageCenters";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminPartners from "./pages/admin/AdminPartners";

import AdminSettings from "./pages/admin/AdminSettings";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminLeads from "./pages/admin/AdminLeads";
import PartnerLayout from "./pages/partner/PartnerLayout";
import PartnerOverview from "./pages/partner/PartnerOverview";
import PartnerMarketing from "./pages/partner/PartnerMarketing";
import PartnerStudents from "./pages/partner/PartnerStudents";
import PartnerProfile from "./pages/partner/PartnerProfile";
import PartnerNotifications from "./pages/partner/PartnerNotifications";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const root = document.getElementById("root");
    if (!root) return;

    root.classList.remove("route-fade-in");
    // Reflow so repeated navigations restart animation reliably.
    void root.offsetWidth;
    root.classList.add("route-fade-in");

    const cleanup = window.setTimeout(() => {
      root.classList.remove("route-fade-in");
    }, 280);

    return () => window.clearTimeout(cleanup);
  }, [pathname]);

  return null;
};

const LegacyUniversityRedirect = () => {
  const { universityId } = useParams<{ universityId: string }>();
  return <Navigate to={`/universities/${universityId || ""}`} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Core public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/contact" element={<Contact />} />

            {/* Destinations */}
            <Route path="/destinations/malaysia" element={<StudyInMalaysia />} />
            <Route path="/destinations/malaysia/:citySlug" element={<CityHub />} />

            {/* Directories */}
            <Route path="/universities" element={<Universities2 />} />
            <Route path="/universities/:universityId" element={<UniversityDetail />} />
            <Route path="/courses" element={<Courses2 />} />
            <Route path="/courses-legacy" element={<CoursesPage />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />

            {/* Application */}
            <Route path="/apply" element={<Application />} />

            {/* Tools */}
            <Route path="/tools/calculator" element={<CostCalculator />} />
            <Route path="/tools/gpa-converter" element={<GpaConverter />} />
            <Route path="/eligibility" element={<EligibilityWizard />} />
            <Route path="/compare" element={<Compare />} />

            {/* Resources */}
            <Route path="/visa-guide" element={<VisaGuide />} />
            <Route path="/housing" element={<Housing />} />
            <Route path="/language-prep" element={<LanguagePrep />} />
            <Route path="/alumni" element={<Alumni />} />
            <Route path="/pre-departure" element={<PreDeparture />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPostPage />} />
            <Route path="/language-centers" element={<LanguageCentersPage />} />
            <Route path="/language-centers/:id" element={<LanguageCenterDetail />} />

            {/* Partner / Agency */}
            <Route path="/partner" element={<B2BLanding />} />
            <Route
              path="/partner-dashboard"
              element={
                <ProtectedRoute requiredRole="partner">
                  <PartnerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<PartnerOverview />} />
              <Route path="students" element={<PartnerStudents />} />
              <Route path="marketing" element={<PartnerMarketing />} />
              <Route path="notifications" element={<PartnerNotifications />} />
              <Route path="profile" element={<PartnerProfile />} />
            </Route>

            {/* Redirects for old routes */}
            <Route path="/study-in-malaysia" element={<Navigate to="/destinations/malaysia" replace />} />
            <Route path="/countries" element={<Navigate to="/destinations/malaysia" replace />} />
            <Route path="/country/:countryId" element={<Navigate to="/destinations/malaysia" replace />} />
            <Route path="/university/:universityId" element={<LegacyUniversityRedirect />} />
            <Route path="/cost-calculator" element={<Navigate to="/tools/calculator" replace />} />
            <Route path="/calculator" element={<Navigate to="/tools/calculator" replace />} />
            <Route path="/gpa-converter" element={<Navigate to="/tools/gpa-converter" replace />} />
            <Route path="/eligibility-test" element={<Navigate to="/eligibility" replace />} />
            <Route path="/b2b" element={<Navigate to="/partner" replace />} />

            {/* Catch-all for coming soon */}
            <Route path="/virtual-tours" element={<ComingSoon />} />
            <Route path="/student-dashboard/*" element={<ComingSoon />} />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />

              <Route path="universities" element={<AdminUniversities />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="accommodations" element={<AdminAccommodations />} />
              <Route path="language-centers" element={<AdminLanguageCenters />} />
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="partners" element={<AdminPartners />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
