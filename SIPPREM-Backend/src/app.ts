import express from "express";

const app = express();
app.use(express.json());

const PORT = 3000;

app.get("/", (req, res) => {
  res.json({
    message: "API funcionando con Express y TypeScript"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});