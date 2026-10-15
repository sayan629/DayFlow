import { useUserStore } from "@/store/userStore";

export async function logout() {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    useUserStore.getState().clearUser();

    return true;
  } catch (error) {
    console.error("Logout error:", error);

    return false;
  }
}