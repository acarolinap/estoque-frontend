
import React, { useState } from "react";
import { authService } from "@/services/authService";

type AuthFormProps = {
  onSuccess: () => void;
};

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.signIn(user, pass);
      onSuccess();
    } catch (err) {
      setError("Falha ao autenticar");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 border rounded-lg p-6 bg-zinc-900 text-white"
      >
        <h1 className="text-xl font-semibold">Login</h1>
        <input
          className="border rounded px-2 py-1 text-black"
          placeholder="Usuário"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          className="border rounded px-2 py-1 text-black"
          placeholder="Senha"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        {error && <span className="text-red-400 text-sm">{error}</span>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-1"
        >
          Entrar
        </button>
      </form>
    </div>
  );
};
