
require('dotenv').config();
const express = require('express');
const path = require('path');


const multer = require('multer')
// const libre = require('libreoffice-convert');
const async = require('async');

var fs = require('fs').promises;
const toPdf = require('mso-pdf');
const PDFGenerator = require('pdfkit');
const imagesToPdf = require("images-to-pdf");
// const rimraf=require('rimraf')
// var findRemoveSync = require('find-remove');
const app = express();
const cors = require('cors')

// const corsOptions ={
//   origin:'http://localhost:5000', 
//   credentials:true,            //access-control-allow-credentials:true
//   optionSuccessStatus:200
// }
app.use(cors(
  {
    origin:"http://localhost:3000"
  }
));


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'files')
  },
  filename: function (req, file, cb) {
    // var ext = path.extname(file.originalname)
    // if (ext !== ".docx" && ext !== ".txt" && ext !== ".pptx" && ext !== ".xls") {
    //   return cb('this file forma is not supported')
    // }
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, Math.round(Math.random() * 1E9) + path.extname(file.originalname))
    // cb(null, true)

  }
})


const upload = multer({ storage: storage })

// libre.convertAsync = require('util').promisify(libre.convert);


var pdf;
var filepath;
var loading = false;
// var deletepdf = false;
var stop = false;

app.post("/upload", upload.single('avatar'), async (req, res) => {
// app.post("/upload", async (req, res) => {
try {
  
  console.log(31);
  
    if (req.file) {
      console.log(32);
  
      filepath = req.file.filename;
      loading = true;
      //check filetype
     if(req.file.filename.includes('.txt')){
      
      var fs = require('fs');
  
      fs.readFile(`./files/${req.file.filename}`, 'utf-8', async(err, data) => {
        if (err) { console.log(err)
          res.json({status:500,data:'there is some error'});
        }else{
          let theOutput = new PDFGenerator
             // pipe to a writable stream which would save the result into the same directory
            theOutput.pipe(fs.createWriteStream(`./files/${req.file.filename}.pdf`))
      
            // write out file
            if(stop == false){
  
              let p1 = new Promise((resolve, reject) => {
                 theOutput.text(data);
                  theOutput.end();
                  resolve(true);
              });
              
               let pdf_done= await p1;
  
                  if(pdf_done){        
                     pdf = req.file.filename;
                    loading = false;
                    res.json({status:200,data:'file is ready'});
                    stop = false;
                  }else{
                    loading = false;
                     res.json({status:500,data:'there is some error'});
                     stop = false;
                  }
                 
           }
           else {
               stop = false;
               loading = false;
               res.json({status:500,data:'please choosefile again'});
          
               return;
           }
        }
       
            
  
       })
  
     }else if(req.file.filename.includes('.png') || req.file.filename.includes('.jpg')){
      // let source = path.join(__dirname, req.file.path);
      // let destination = path.join(__dirname, `./pdfs/${req.file.filename}.pdf`);
       if(stop == false){
  
        let img_done = await imagesToPdf([`./files/${req.file.filename}`], `./files/${req.file.filename}.pdf`)
        if(img_done){
          pdf = req.file.filename;
          loading = false;
          res.json({status:200,data:'file is ready'});
          stop = false;
        }else{
          loading = false;
           res.json({status:500,data:'there is some error'});
           stop = false;
        }
       
      }else{
        stop = false;
        loading = false;
         res.json({status:500,data:'please choosefile again'});
    
         return;
      }
       
  
     }else{
  console.log(33);
  
        let source = path.join(__dirname, `./files/${req.file.filename}`);
        // console.log(req.file.filename)
      
        //  var outputpath = path.join(__dirname, `/files/${req.file.filename}${ext}`);
        let destination = path.join(__dirname, `./files/${req.file.filename}.pdf`);
  console.log(34);
           
         if (stop == false) {
          console.log(35);
  
          let p2 = new Promise((resolve, reject) => {
            toPdf.convert(source,destination, function (errors){
              if(errors) {
                reject(errors)
              }
              resolve(true)
               })   
               
            
            });
  console.log(36);
  
               let done= await p2;
               if(done){
  console.log(37);
  
                p2.then(()=>{
                  pdf = req.file.filename
                  loading = false;
                  res.json({status:200,data:'file is ready'});
                  stop = false;
                }).catch(()=>{
                  stop = false;
                  loading = false;
                  res.json({status:500,data:'there is some error'});
                })
  console.log(38);
                 
               }
                 
               
            } else {
  console.log(39);
  
                    stop = false;
                loading = false;
                res.json({status:500,data:'please choosefile again'});
  console.log(40);
       
                return;
            }
  
       }
  
      
    
      
    }
} catch (error) {
  console.log(11, error);
  res.json({status: 500, data: error})
}
})


//  const func=()=>{
//   findRemoveSync(__dirname + '/files', { age: { seconds: 10 },
//       extensions: ['.docx', '.pptx','.txt','.xlsx','png','.jpg','.pdf']})
  
//  }

// func();


app.get("/delFile", (req, resp) => {

  try {
     if(loading == false){
      
    checkFileExists(filepath)
    function checkFileExists(file) {
      return fs.access(`./files/${file}`, fs.constants.F_OK)
        .then(() => {
          // console.log('exist')
          fs.unlink(`./files/${file}`)
        })
        .catch(() => console.log('notexist'))
    }


    checkpdfExists(pdf)
    function checkpdfExists(file) {
      return fs.access(`./files/${file}.pdf`, fs.constants.F_OK)
        .then(() => {
          // console.log('exist')
          fs.unlink(`./files/${file}.pdf`)
        })
        .catch(() =>
         console.log('notexist')
         )
    }

  }

    if (loading == true) {
      stop = true;
    }
    
   resp.json('file deleted')


   

  } catch (error) {
    resp.json(error)
  }

})


//download file
app.get('/getfile', async (req, res) => {
  try {
    checkpdfExists(pdf)
    function checkpdfExists(file) {
      return fs.access(`./files/${file}.pdf`, fs.constants.F_OK)
        .then(() => {
          //  console.log('exist')
          res.download(`./files/${file}.pdf`);
           //deleting files 
      
        })
        .catch(() => res.json('file deleted again choose file'))
    }
   
   
  } catch (error) {
    res.json(error)
  }
})




app.get('/', (req, res) => {
console.log(52);
  res.send('hello TO CONVERTER1')
})




const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`server is running perfectly on port ${port}`)
})










  // if (req.file) {

  //   let inputPath = path.join(__dirname,req.file.path);
  //   const file = await fs.readFile(inputPath);
  //  let outputfilepath = Date.now() + 'output.pdf'
  //   await libre.convertAsync(file, '.pdf', undefined, (err, done) => {
  //     if (err) {
  //       fs.unlink(req.file.path)
  //       fs.unlink(outputfilepath)
  //       res.send("some error occured")
  //     }

  //     // console.log(outputfilepath)
  //     fs.writeFile(outputfilepath, done);

  //     res.download(outputfilepath, (err) => {
  //       if (err) {
  //         fs.unlink(req.file.path)
  //         fs.unlink(outputfilepath)
  //         res.send("some error occured")
  //       }
  //       fs.unlink(req.file.path)
  //       fs.unlink(outputfilepath)
  //     })
  //   });

  // } 






// // const libre = require('libreoffice-convert');
// // libre.convertAsync = require('util').promisify(libre.convert);

// // async function main() {
// //   const ext = '.pdf'
// //   const inputPath = path.join(__dirname, '61++UoG4k8L._UL1241_.jpg');
// //   console.log(inputPath)

// //   const outputPath = path.join(__dirname, `example${ext}`);

// //   // Read file
// //   const docxBuf = await fs.readFile(inputPath);

// //   // Convert it to pdf format with undefined filter (see Libreoffice docs about filter)
// //   let pdfBuf = await libre.convertAsync(docxBuf, ext, undefined);
// //   console.log(pdfBuf)

// //   // Here in done you have pdf file which you can save or transfer in another stream
// //   await fs.writeFile(outputPath, pdfBuf);
// // }

// // main().catch(function (err) {
// //   console.log(`Error converting file: ${err}`);
// // });




// // var tmp = require('temporary')
// // var fs = require('fs')
// // var path = require('path');
// // var exec = require('child_process').exec;

// // module.exports = (buffer) => {

// //   return new Promise(function(resolve, reject) {

// //     var file = new tmp.File()
// //     var outdir = new tmp.Dir()
// //     file.writeFile(buffer, (err) => {

// //       if(err) reject(err)

// //       var cmd = 'soffice --headless --convert-to pdf ' + file.path + ' --outdir ' + outdir.path;

// //       exec(cmd, function(error, stdout, stderr) {
// //         if(error) {
// //           reject(error)
// //         } else {
// // 	  fs.readFile(path.join(outdir.path, path.basename(file.path, path.extname(path.basename(file.path)))+".pdf"), (err, buffer) => {
// // 	    if(err) reject(err)
// // 	    resolve(buffer)
// // 	  })
// //         }
// //       });
// //     })
// //   });

// // }

// // var docxconverter=require('docx-pdf');

// // docxconverter("test.doc","output.pdf",(err,result)=>{
// //  if(err){
// //     console.log(err);
// //  }
// //  console.log(result)


// // })



   // if (deletefile == true) {
    //   // console.log(filepath)
    //   fs.unlink(`./files/${filepath}`)
    //   deletefile = false;
    // }

 // if (deletepdf == true) {
    //   // console.log(pdf);
    //   fs.unlink(`./${pdf}.pdf`)
    //   deletepdf = false;
    //   resp.send("File Deleted")
    // }

// 

// let file = './files/Job Letter.docx'

// try {
//   if (fs.existsSync(paath)) {
//     console.log('The file exists.')
//   } else {
//     console.log('The file does not exist.')
//   }
// } catch (err) {
//   console.error(err)
// }
// function checkFileExists(file) {
//   return fs.access(file, fs.constants.F_OK)
//     .then(() => {
//       console.log('exist')
//       fs.unlink(file)
//     })
//     .catch(() => console.log('notexist'))
// }
// checkFileExists(file)
