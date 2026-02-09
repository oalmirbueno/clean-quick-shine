import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AccessDenied from "@/pages/AccessDenied";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    signOut: vi.fn(),
  }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

describe("AccessDenied", () => {
  it("renders 403 page with correct elements", () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: "/access-denied", state: { roles: ["client"] } }]}>
        <AccessDenied />
      </MemoryRouter>
    );

    expect(screen.getByText("Acesso Negado")).toBeInTheDocument();
    expect(screen.getByText("Você não tem permissão para acessar esta área.")).toBeInTheDocument();
    expect(screen.getByText("Ir para minha área")).toBeInTheDocument();
    expect(screen.getByText("Sair da conta")).toBeInTheDocument();
  });
});
