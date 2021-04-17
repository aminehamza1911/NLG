const express = require('express');
const app = express();
const cors = require('cors');
const upload = require('express-fileupload');
// fs npm package 
const fs = require("fs"); 
const excelToJson = require('convert-excel-to-json');
const rosaenlgPug = require('rosaenlg');
const htmlDocx = require("html-to-docx");
const path = require('path');
const puppeteer = require('puppeteer');
const trad = require("googletrans").default;
//const { get } = require("http");

// in case we have CSV files
/*let csvToJson = require('convert-csv-to-json');
let json = csvToJson.formatValueByType().getJsonFromCsv("template_evenement.csv");


for(let i=0; i<json.length;i++){
    console.log(json[i]);
}*/

app.use(cors());

app.use(upload());

// engine
//translate.engine = "libre";
//translate.key = process.env.YANDEX_KEY;


app.post('/upload', (req, res) => {

    if(req.files) {
        const file = req.files.file;
        const format = req.body.format;
        const lang = req.body.lang;
    
        const fileName = file.name;

        file.mv('./uploads/' + fileName, (error) => {
          if(error) {
              res.send(error);
          } else {
            let events = excelToJson({
              sourceFile: './uploads/' + fileName,
           
              //sheets: ['Jeudi'],
              header:{
                  rows: 8
              },
              columnToKey: {
              A: 'Jour',
              B: 'Jour_nom',
              C: 'Jour_date',
              D: 'Nom_intervenant',
              E: 'Titre_intervenant',
              F: 'Theme_intervenant',
              G: 'Theme_evenement',
              H: 'Heure_debut',
              I: 'Heure_fin',
              J: 'Intervention',
              K: 'Lieu',
              L: 'Nombre_visiteurs'
          }
              
          });
          
          let header_infos = excelToJson({
              sourceFile: './uploads/' + fileName,
           
              //sheets: ['Jeudi'],
              //header:{
                  //rows: 8
              //},
          
              
          });
          
          // display our result
          //console.log(events)
          //console.log(header_infos)
          
          
          // Get the total guests for the event 
          function get_nombre_tot_visiteur(jours){
              let nb = 0; 
              for(let jour = 0;jour < jours.length; jour++){
                  for(let i = 0;i< events[jours[jour]].length; i++){
                      nb+=events[jours[jour]][i].Nombre_visiteurs;
                  }
              }
          
              return nb;
          }
          
          // Get jour with maximal attendance
          function get_jour_max(jours){
              let max = 0;
              let nb = 0;
              let jour_max = '';
              
              for(let jour = 0;jour < jours.length; jour++){
                  for(let i = 0;i< events[jours[jour]].length; i++){
                      nb+=events[jours[jour]][i].Nombre_visiteurs;
                  }
                  if(max < nb){
                  max = nb;
                  jour_max = jours[jour];
          
                  }
                  nb = 0
                  
              }
          
              return {'attendance_max':max,'jour_max':jour_max};
          }
          
          // get attendance
          function get_attendance(jour){
              let nb = 0; 
                  for(let i = 0;i< events[jour].length; i++){
                      nb+=events[jour][i].Nombre_visiteurs;
                  }
              
          
              return nb;
          }
          
          // get nbr event
          function get_nbr_event(jour){
              let event_theme = new Array();
                  for(let i = 0;i< events[jour].length; i++){
                      event_theme.push(events[jour][i].Theme_evenement);
                  }
                  
                  distinct_theme =  [...new Set(event_theme)];
              
              return distinct_theme.length;
          }
          
          // get nbr event
          function get_nbr_salle(jour){
              let event_Lieu = new Array();
                  for(let i = 0;i< events[jour].length; i++){
                      event_Lieu.push(events[jour][i].Lieu);
                  }
                  
                  distinct_Lieu =  [...new Set(event_Lieu)];
              
              return distinct_Lieu.length;
          }
          
          // Get jour with maximal attendance for a given day 
          function get_attend_max_per_day(jour){
              let max = 0;
              let nb = 0;
              let Nom_intervenant;
              let titre;
              let theme;
              
              for(let i = 0;i< events[jour].length; i++){
                  nb = events[jour][i].Nombre_visiteurs;
                  if(max < nb){
                      max = nb;
                      Nom_intervenant = events[jour][i].Nom_intervenant;
                      titre = events[jour][i].Titre_intervenant;
                      theme = events[jour][i].Theme_intervenant;
                  }
                  // we can add more if max is founded more than one time
          
              }
          
              return {'Nom_intervenant':Nom_intervenant,'titre':titre, 'theme':theme,'attendance':max};
           
          }
          /* get nbr intervention
          function get_nbr_intervention(jour){
              let nb = new Array();
              let nbb = 0;
              let intervention =  new Array();
                  
                  for(let i = 0;i< events[jour].length; i++){
                      intervention.push(events[jour][i].Intervention);
                  }
                  
                  distinct_intervention =  [...new Set(intervention)];
                  
                  for(let j = 0;j< distinct_intervention.length; j++){
                      for( i = 0;i< events[jour].length; i++){
                          if(events[jour][i].Intervention == distinct_intervention[j])
                              nbb++;
                      }
                      nb[j] = {"Intervention": distinct_intervention[j], "nbr_intervention": nbb};
                      nbb = 0;
                  }
                  
              
              return nb;
          }
          */
          function get_nbr_intervention(jour){
              let nbb = 0;
                      for( i = 0;i< events[jour].length; i++){
                          if(events[jour][i].Intervention == 'intervention')
                              nbb++;
                      }
              return nbb;
          }
          
          
          // get duration 
          
          function get_duration(time1, time2) {
              first_hour_split = time1.split('h');
              second_hour_split = time2.split('h');
              let hours;
              let minute;
              if(first_hour_split[1].length === 0){
                  first_hour_split[1] = '00';
              }
              if(second_hour_split[1].length === 0){
                  second_hour_split[1] = '00';
              }
          
              if (parseInt(first_hour_split[0]) < parseInt(second_hour_split[0]) && parseInt(first_hour_split[1]) < parseInt(second_hour_split[1])) {
          
                  //As for the addition, the subtraction is carried out separately, column by column.
                  hours = parseInt( second_hour_split[0]) - parseInt( first_hour_split[0]);
                  minute = parseInt( second_hour_split[1]) - parseInt( first_hour_split[1]);
          
                  let _hours = '';
                  let _minute = '';
          
                  if (hours < 10) {
                      _hours ='0' + hours;
                  } else {
                      _hours = hours;
                  }
          
                  if (minute < 10) {
                      _minute = '0' + minute;
                  } else {
                      _minute = minute;
                  }
          
                  return (_hours + 'H' + _minute + 'm')
          
              }
              else if (parseInt( second_hour_split[0]) > parseInt( first_hour_split[0])) {
                  if (parseInt( second_hour_split[1]) < parseInt( first_hour_split[1])) {
          
                      // As before we subtract column by column ... and we realize that it's impossible because our minute in second hour is greater than our minute in first hour
                      // We will transform 1 hour in 60 minutes
                      let _hours = parseInt( second_hour_split[0]) - 1;
                      let _minute = parseInt( second_hour_split[1]) + 60;
                      let final_hours = '';
                      let final_min = '';
          
                      hours = _hours - parseInt( first_hour_split[0]);
                      minute = _minute - parseInt( first_hour_split[1]);
          
                      if (hours < 10) {
                          final_hours = '0' + hours;
                      } else {
                          final_hours = hours;
                      }
          
                      if (minute < 10) {
                          final_min = '0' + minute;
                      } else {
                          final_min = minute;
                      }
          
                      return (final_hours + 'H' + final_min)
                  }
          
                  if (parseInt( second_hour_split[1]) === parseInt( first_hour_split[1])) {
                      hours = parseInt( second_hour_split[0]) - parseInt( first_hour_split[0]);
                      let final_hours = '';
          
                      if (hours < 10) {
                          final_hours = '0' + hours;
                      } else {
                          final_hours = hours;
                      }
          
                      return (final_hours + 'H' + '00')
                  }
          
              }else if (parseInt( first_hour_split[0]) > parseInt( second_hour_split[0])) {
                  let first_hour_only_hour = parseInt( first_hour_split[0]);
                  let second_hour_only_hour = parseInt( second_hour_split[0]);
          
                  let first_hour_only_min = parseInt( first_hour_split[1]);
                  let second_hour_only_min = parseInt( second_hour_split[1]);
          
                  let tmp_hour = 24 - first_hour_only_hour;
                  let tmp_ttl_hour = tmp_hour + second_hour_only_hour;
          
                  let tmp_ttl_min = first_hour_only_min + second_hour_only_min;
                  let tmp_new_hour = 0;
                  let tmp_new_min_mod = 0;
          
                  let _hours = '';
                  let _min = '';
          
                  if (tmp_ttl_min > 59) {
                      tmp_new_hour = parseInt(tmp_ttl_min/60);
                      tmp_new_min_mod = tmp_ttl_min%60;
          
                      tmp_ttl_hour += tmp_new_hour;
                  } else {
                      tmp_new_min_mod = tmp_ttl_min
                  }
          
                  if (tmp_ttl_hour < 10) {
                      _hours = '0' + tmp_ttl_hour;
                  } else {
                      _hours = tmp_ttl_hour
                  }
          
                  if (tmp_new_min_mod < 10) {
                      _min = '0' + tmp_new_min_mod
                  } else {
                      _min = tmp_new_min_mod
                  }
          
                  return(_hours + 'H' + _min)
              } else if (parseInt( first_hour_split[0]) === parseInt( second_hour_split[0])) {
                  hours = '00';
                  let minute = 0;
                  if (parseInt( first_hour_split[1]) < parseInt( second_hour_split[1])) {
                      minute = parseInt( second_hour_split[1]) - parseInt( first_hour_split[1]);
                  }
          
                  if (minute < 10) {
                      return(hours + 'H0' + minute)
                  } else  {
                      return(hours + 'H' + minute)
                  }
              }else if (parseInt( first_hour_split[0]) === 0 && parseInt( first_hour_split[1]) === 0) {
                  hours = parseInt( second_hour_split[0]);
                  minute = parseInt( second_hour_split[1]);
          
                  if (hours === 0) {
                      return('00H' + minute)
                  }else if (minute === 0){
                      if (hours < 10) {
                          return('0' + hours + 'H00');
                      }else {
                          return(hours + 'H00');
                      }
                  }else {
                      return(hours + 'H' + minute)
                  }
              }
          }
          
          
          // Get general information
          function get_general_info(header){
                  for( i = 0;i < 5; i++){
                      if(i == 0) Titre_event = header[jours[0]][i].C;
                      if(i == 1) Nom_organisation = header[jours[0]][i].C;
                      if(i == 2) Theme_global = header[jours[0]][i].C;
                      if(i == 3) Lieu = header[jours[0]][i].C;
                      if(i == 4) Ville = header[jours[0]][i].C;
                          
                  }
              return {"Titre_event":Titre_event,"Nom_organisation":Nom_organisation,"Theme_global":Theme_global,"Lieu":Lieu,"Ville":Ville}
          
          }
          
          // Get info about each row
          function get_rows_morning(jour){
              let nb_morning = new Array();
              let d ;
              let duree ;
          
              for(let i = 0;i< events[jour].length; i++){
                  first_hour_split = events[jour][i].Heure_debut.split('h');
          
                  if (first_hour_split[0] < 14){
                      d = get_duration(events[jour][i].Heure_debut,events[jour][i].Heure_fin);
                      if (d === undefined){
                          d = '';
                          duree = d;
                      }
                      
                      else{
          
                      fhour_split = d.split('H');
                      if (parseInt(fhour_split[0]) == 0){
                          duree = fhour_split[1]+ 'min';
          
                      }
                      else {
                          if (parseInt(fhour_split[1]) == 0){
                          if (parseInt(fhour_split[0]) == 1 ) duree = 'une heure';
                          if (parseInt(fhour_split[0]) == 2) duree = 'deux heure' ;
                          if (parseInt(fhour_split[0]) == 3) duree = 'trois heure';
                          if (parseInt(fhour_split[0]) == 4) duree = 'qutre heure';
                          if (parseInt(fhour_split[0]) == 5) duree = 'cinq heure';
                          if (parseInt(fhour_split[0]) == 6) duree = 'six heure';
                          if (parseInt(fhour_split[0]) == 7) duree = 'sept heure';
                          if (parseInt(fhour_split[0]) == 8) duree = 'huit heure';
                          if (parseInt(fhour_split[0]) == 9) duree = 'neuf heure';       
                          }
                          else  {
                              if (parseInt(fhour_split[0]) == 1 ) duree = 'une heure et '+fhour_split[1]+'min';
                              if (parseInt(fhour_split[0]) == 2) duree = 'deux heure et '+fhour_split[1]+'min';
                              if (parseInt(fhour_split[0]) == 3) duree = 'trois heure et '+fhour_split[1]+'min';
                              if (parseInt(fhour_split[0]) == 4) duree = 'qutre heure et '+fhour_split[1]+'min';
                              if (parseInt(fhour_split[0]) == 5) duree = 'cinq heure et '+fhour_split[1]+'min';
                              if (parseInt(fhour_split[0]) == 6) duree = 'six heure et '+fhour_split[1]+'min';
                              if (parseInt(fhour_split[0]) == 7) duree = 'sept heure et '+fhour_split[1]+'min';
                              if (parseInt(fhour_split[0]) == 8) duree = 'huit heure et '+fhour_split[1]+'min';
                              if (parseInt(fhour_split[0]) == 9) duree = 'neuf heure et '+fhour_split[1]+'min';  
                          }  
                      }
                  }
          
                      nb_morning.push({"Nom_intervenant": events[jour][i].Nom_intervenant,"Titre_intervenant":events[jour][i].Titre_intervenant, "Theme_event":events[jour][i].Theme_evenement, "Theme_intervenant":events[jour][i].Theme_intervenant,"Heure_debut":events[jour][i].Heure_debut,"Heure_fin": events[jour][i].Heure_fin,'nb_lieux': get_nbr_salle(jour),"nb_intervention": get_nbr_intervention(jour),"lieu":events[jour][i].Lieu,"intervention":events[jour][i].Intervention,"duree":duree})
                  }    
              }
              return  nb_morning
          }
          
          function get_rows_evening(jour){
              let nb_evening = new Array();
              let d;
              for(let i = 0;i< events[jour].length; i++){
                  first_hour_split = events[jour][i].Heure_debut.split('h');
          
                  if (first_hour_split[0] >= 14){
                      d = get_duration(events[jour][i].Heure_debut,events[jour][i].Heure_fin);
                      if (d === undefined){
                          d = '';
                          duree = d;
                      }
                      
                      else{
          
                      fhour_split = d.split('H');
                      if (parseInt(fhour_split[0]) == 0){
                          duree = fhour_split[1]+ 'min';
          
                      }
                      
                      else {
                          if (parseInt(fhour_split[1]) == 0){
                              if (parseInt(fhour_split[0]) == 1 ) duree = 'une heure';
                              if (parseInt(fhour_split[0]) == 2) duree = 'deux heure' ;
                              if (parseInt(fhour_split[0]) == 3) duree = 'trois heure';
                              if (parseInt(fhour_split[0]) == 4) duree = 'qutre heure';
                              if (parseInt(fhour_split[0]) == 5) duree = 'cinq heure';
                              if (parseInt(fhour_split[0]) == 6) duree = 'six heure';
                              if (parseInt(fhour_split[0]) == 7) duree = 'sept heure';
                              if (parseInt(fhour_split[0]) == 8) duree = 'huit heure';
                              if (parseInt(fhour_split[0]) == 9) duree = 'neuf heure';       
                              }
                              else  {
                                  if (parseInt(fhour_split[0]) == 1 ) duree = 'une heure et '+fhour_split[1]+'min';
                                  if (parseInt(fhour_split[0]) == 2) duree = 'deux heure et '+fhour_split[1]+'min';
                                  if (parseInt(fhour_split[0]) == 3) duree = 'trois heure et '+fhour_split[1]+'min';
                                  if (parseInt(fhour_split[0]) == 4) duree = 'qutre heure et '+fhour_split[1]+'min';
                                  if (parseInt(fhour_split[0]) == 5) duree = 'cinq heure et '+fhour_split[1]+'min';
                                  if (parseInt(fhour_split[0]) == 6) duree = 'six heure et '+fhour_split[1]+'min';
                                  if (parseInt(fhour_split[0]) == 7) duree = 'sept heure et '+fhour_split[1]+'min';
                                  if (parseInt(fhour_split[0]) == 8) duree = 'huit heure et '+fhour_split[1]+'min';
                                  if (parseInt(fhour_split[0]) == 9) duree = 'neuf heure et '+fhour_split[1]+'min';  
                              }
                      }
                  }
          
                      nb_evening.push({"Nom_intervenant": events[jour][i].Nom_intervenant,"Titre_intervenant":events[jour][i].Titre_intervenant, "Theme_event":events[jour][i].Theme_evenement, "Theme_intervenant":events[jour][i].Theme_intervenant,"Heure_debut":events[jour][i].Heure_debut,"Heure_fin": events[jour][i].Heure_fin,'nb_lieux': get_nbr_salle(jour),"nb_intervention": get_nbr_intervention(jour),"lieu":events[jour][i].Lieu,"intervention":events[jour][i].Intervention,"duree":duree})
                  }
              }
              return  nb_evening
          }
          
          function get_row_moring_for_all_days(jours){
              monring = new Array();
              for(let j = 0; j < jours.length;j++){
                  monring.push(get_rows_morning(jours[j]))
              }
              return monring
          
          }
          
          function get_row_evening_for_all_days(jours){
              evening = new Array();
              for(let j = 0; j < jours.length;j++){
                  evening.push(get_rows_evening(jours[j]))
              }
              return evening
          
          }
          
          // Get Lieu
          
          function get_lieu(jours){
              let event_Lieu = new Array();
              for(let j = 0; j < jours.length;j++){
              for(let i = 0;i< events[jours[j]].length; i++){
                  event_Lieu.push(events[jours[j]][i].Lieu);
              }
          }
                      
              distinct_Lieu =  [...new Set(event_Lieu)];
                  
              return distinct_Lieu;  
          }
          
          // days from the excel file
          let jours = new Array();
          for (let x in events){
              jours.push(x)
          }
          //console.log(get_general_info(header_infos))
          //console.log(events)
          // Rosae NLG
          const resu = rosaenlgPug.renderFile('article.pug', {
              language: 'fr_FR',
              infos: get_general_info(header_infos),
              jours: jours,
              Nombre_visiteurs: get_nombre_tot_visiteur(jours),
              Jour_maximum: get_jour_max(jours),
              ratio: Math.round(get_jour_max(jours).attendance_max/get_nombre_tot_visiteur(jours) * 100),
              attendance: get_attendance(jours[0]),
              nbr_event: get_nbr_event(jours[0]),
              nbr_salle: get_nbr_salle(jours[0]),
              lieux: get_lieu(jours),
              att_max_per_day: get_attend_max_per_day(jours[0]),
              events_morning: get_row_moring_for_all_days(jours),
              events_evening: get_row_evening_for_all_days(jours),
              events: events,
          
          
              cache: true,
            });
            //console.log(resu);

            // Generate WORD Document
            //const converted = htmlDocx.asBlob(toString(resu));
            const NvfileName = fileName.split('.');
            const fnDoc = NvfileName[0]+'.docx';
            const documentPath = `${__dirname}/files/${fnDoc}`; 
            const fnPdf = NvfileName[0]+'.pdf';
            //FileSaver.saveAs(converted, fileNameDoc);function char_count(str) 
            // Promise
            trad(resu, { from: "fr", to: lang}).then(function (result) {
            //console.log(result.text); 
            text = result.text.replace(/ < /g,'\<');
            text = text.replace(/<\/ /g,'<\/');
            text = text.replace(/ \/> /g,'\>');
            text = text.replace(/ \/ /g,'\/>');
            text = text.replace(/<\/</g,'</');
            text = text.replace(/\>\>/g,'>');
            text = text.replace(/<\/>p/g,'</p>');

            let resudoc = `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                </head>
                <body>` + text + `</body></html>`;
            // GENERATE DOCX
            if(format ==='docx'){
            (async () => {
              const fileBuffer = await htmlDocx(resudoc, null, {
                footer: true,
                pageNumber: true,
              });
            
              fs.writeFile(documentPath, fileBuffer, function(err) {
                if (error) {
                    console.log('Docx file creation failed');
                    throw error;
                    //return;
                  }              
                  else{
                    console.log('Docx file created successfully');
                    res.download(documentPath,fnDoc, function(err) {
                        if(err) throw err;
                        else{
                            const delete_path_word = process.cwd() + `/files/${fnDoc}`;
                            const delete_path_excel = process.cwd() + `/uploads/${fileName}`;
                            try {
                                fs.unlinkSync(delete_path_excel);
                                fs.unlinkSync(delete_path_word);
                                //file removed
                              } catch(err) {
                              console.error(err)
                              }
                        }
              });
            }
            });

            })();   

        }

            // Generate PDF
            else{

                (async () => {
                    // launch a new chrome instance
                    const browser = await puppeteer.launch({
                        args: ['--no-sandbox', '--disable-setuid-sandbox'],

                    })
                  
                    // create a new page
                    const page = await browser.newPage()
                  
                    // set your html as the pages content
                    await page.setContent(resudoc, {
                      waitUntil: 'domcontentloaded'
                    })
                  
                    // or a .pdf file
                    await page.pdf({
                      format: 'A4',
                      path: `${__dirname}/files/${fnPdf}`
                    })
                  
                    // close the browser
                    await browser.close()
                    res.download(`${__dirname}/files/${fnPdf}`,fnPdf, function(err){
                        if(err) throw err;
                        else{
                            const delete_path_pdf = process.cwd() + `/files/${fnPdf}`;
                            const delete_path_excel = process.cwd() + `/uploads/${fileName}`;
                            try {
                                fs.unlinkSync(delete_path_excel);
                                fs.unlinkSync(delete_path_pdf);
                                //file removed
                              } catch(err) {
                              console.error(err)
                              }
                        }
                    });
                  })()




            /*let options = { format: 'A4', path:`${__dirname}/files/${fnPdf}` };

            let filePdf = { content: resudoc };

            html_to_pdf.generatePdf(filePdf, options).then(pdfBuffer => {
                res.download(`${__dirname}/files/${fnPdf}`,fnPdf, function(err){
                    if(err) throw err;
                    else{
                        const delete_path_pdf = process.cwd() + `/files/${fnPdf}`;
                        const delete_path_excel = process.cwd() + `/uploads/${fileName}`;
                        try {
                            fs.unlinkSync(delete_path_excel);
                            fs.unlinkSync(delete_path_pdf);
                            //file removed
                          } catch(err) {
                          console.error(err)
                          }
                    }
                });


            });*/
        }
            
            }).catch(function (error) {
                throw error
            });


            
        
          }
      });     

    }
});

app.listen(3001, () => {
    console.log('Server listen on PORT 3001');
});