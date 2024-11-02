
const express = require("express"); 
const app = express();
const port = 3000;
const userRouter=require("./routes/user")
const cors =require("cors")
const bodyParser=require("body-parser")
const mongoose=require("mongoose")
const cookieParser=require("cookie-parser")
const adminRouter=require("./routes/admin")
const employerRouter=require("./routes/employer")

app.use(cookieParser());
app.use(express.json()); 


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST',"DELETE"],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use("/", userRouter)
app.use("/", adminRouter)
app.use('/',employerRouter)


mongoose
.connect("mongodb://localhost:27017/Jobseekers", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
