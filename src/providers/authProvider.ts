import { AuthProvider } from "@refinedev/core";
import { createDirectus, authentication, rest, login, readMe } from "@directus/sdk";

// Get Directus configuration from environment variables
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || "https://admin-api-directus.dqyvuv.easypanel.host";

// Custom login function for production
const loginToDirectus = async (email: string, password: string) => {
  if (import.meta.env.PROD) {
    // Use fetch API for production
    const response = await fetch('/api/directus/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.message || 'Login failed');
    }

    const responseData = await response.json();
    // Directus API returns data wrapped in a 'data' property
    return responseData.data || responseData;
  } else {
    // Use Directus SDK for development
    const client = createDirectus(DIRECTUS_URL)
      .with(authentication("json"))
      .with(rest());
      
    return await client.request(login(email, password));
  }
};

// Custom function to get user info
const getUserInfo = async (token: string) => {
  if (import.meta.env.PROD) {
    // Use fetch API for production
    const response = await fetch('/api/directus/users/me?fields=*,role.name', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    const responseData = await response.json();
    // Directus API returns data wrapped in a 'data' property
    return responseData.data || responseData;
  } else {
    // Use Directus SDK for development
    const client = createDirectus(DIRECTUS_URL)
      .with(authentication("json"))
      .with(rest());
    
    client.setToken(token);
    return await client.request(readMe({
      fields: ['*', 'role.name']
    }));
  }
};

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      console.log('Login attempt with:', email);
      
      // Real Directus login
      const result = await loginToDirectus(email, password);

      if (result.access_token) {
        // Store tokens
        localStorage.setItem("directus_access_token", result.access_token);
        if (result.refresh_token) {
          localStorage.setItem("directus_refresh_token", result.refresh_token);
        }

        // Get user information
        const user = await getUserInfo(result.access_token);
        
        // Map Directus role names to our app role names
        let appRole = "agent"; // default
        if (user.role?.name === "Administrator") {
          appRole = "admin";
        } else if (user.role?.name === "Manager") {
          appRole = "manager";
        } else if (user.role?.name === "Agent") {
          appRole = "agent";
        }
        
        // Store user data
        const userData = {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
          role: appRole,
          avatar: user.avatar,
        };

        localStorage.setItem("auth", JSON.stringify(userData));
        
        return {
          success: true,
          redirectTo: "/",
        };
      }

      return {
        success: false,
        error: {
          message: "Login failed",
          name: "Invalid email or password",
        },
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      return {
        success: false,
        error: {
          message: "Login failed",
          name: error.errors?.[0]?.message || error.message || "An error occurred during login",
        },
      };
    }
  },

  logout: async () => {
    // Clear local storage
    localStorage.removeItem("auth");
    localStorage.removeItem("directus_access_token");
    localStorage.removeItem("directus_refresh_token");
    
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    try {
      const token = localStorage.getItem("directus_access_token");
      const auth = localStorage.getItem("auth");
      
      if (token && auth) {
        return {
          authenticated: true,
        };
      }

      return {
        authenticated: false,
        redirectTo: "/login",
      };
    } catch (error) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },

  getPermissions: async () => {
    const auth = localStorage.getItem("auth");
    if (auth) {
      const user = JSON.parse(auth);
      return user.role;
    }
    return null;
  },

  getIdentity: async () => {
    const auth = localStorage.getItem("auth");
    if (auth) {
      const user = JSON.parse(auth);
      return user;
    }
    return null;
  },

  onError: async (error) => {
    if (error.response?.status === 401) {
      return {
        logout: true,
        redirectTo: "/login",
      };
    }

    return { error };
  },
};