import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Shell } from './components/layout/Shell';
import Auth from './pages/Auth';
import Stats from './pages/Stats';
import Orders from './pages/Orders';
import Accounts from './pages/Accounts';
import Users from './pages/Users';
import Touches from './pages/Touches';
import Credits from './pages/Credits';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
      <p className="text-xl text-foreground">Sector not found.</p>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Auth} />
      
      {/* Protected routes wrapped in Shell */}
      <Route path="/">
        <Shell><Stats /></Shell>
      </Route>
      <Route path="/orders">
        <Shell><Orders /></Shell>
      </Route>
      <Route path="/accounts">
        <Shell><Accounts /></Shell>
      </Route>
      <Route path="/users">
        <Shell><Users /></Shell>
      </Route>
      <Route path="/touches">
        <Shell><Touches /></Shell>
      </Route>
      <Route path="/credits">
        <Shell><Credits /></Shell>
      </Route>

      <Route>
        <Shell><NotFound /></Shell>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
