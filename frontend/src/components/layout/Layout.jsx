import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout({ children }) {
  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* MENÚ LATERAL FIJO */}
      <div
        style={{
          width: "260px",
          minWidth: "260px",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 1000,
        }}
      >
        <Sidebar />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: "260px",
          minHeight: "100vh",
          overflowY: "auto",
        }}
      >
        {/* ENCABEZADO */}
        <Header />

        {/* CONTENIDO DE CADA PÁGINA */}
        <main
          className="p-4 bg-light"
          style={{
            minHeight: "calc(100vh - 73px)",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
