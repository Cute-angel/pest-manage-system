const server_address = "http://localhost:8000";

const getToken = () => localStorage.getItem("token");

export { server_address, getToken };
