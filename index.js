import app from './app.js'
import { HOST, PORT } from './src/config/config.js'

app.listen(PORT, () => console.log(`server starting on ${HOST}:${PORT}`))