const data = {
  id: "12345",
  name: "John Doe",
  email: "john.doe@example.com",
  roles: ["admin", "editor", "viewer"],
  createdAt: new Date().toISOString(),
  preferences: {
    theme: "dark",
    notifications: true,
  },
  meta: {
    loginCount: 42,
    lastLogin: new Date().toISOString(),
    ip: "192.168.1.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  },
};

module.exports = { data };
