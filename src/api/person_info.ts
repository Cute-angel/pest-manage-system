const login = (user: string, password: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (user === "admin" && password === "password") {
        resolve({ success: true });
      } else {
        reject({ success: false, message: "Invalid credentials" });
      }
    }, 1000);
  });
};

export default login;
