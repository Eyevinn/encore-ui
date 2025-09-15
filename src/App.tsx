import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './contexts/ThemeContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { Layout } from './components/Layout';

// Pages  
import Dashboard from './pages/Dashboard.tsx';
import Jobs from './pages/Jobs.tsx';  
import JobDetail from './pages/JobDetail.tsx';
import Queue from './pages/Queue.tsx';
import Settings from './pages/Settings.tsx';
import CreateJob from './pages/CreateJob.tsx';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <ThemeProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/new" element={<CreateJob />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/queue" element={<Queue />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </Router>
        </ThemeProvider>
      </ConfigProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
