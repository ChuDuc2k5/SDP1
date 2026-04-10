import express from 'express';

const   app = express();
app.use(express.json());
const port = 3000;


app.listen(port, () => console.log(` Server đang chạy tại http://localhost:${port}`));