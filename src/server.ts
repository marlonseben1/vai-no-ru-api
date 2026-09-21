import { app } from './app.js';

const port = 3003;

app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
