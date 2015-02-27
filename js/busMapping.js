//GLOBALS (die manuell angepasst werden können)
var terminationInterval = 1; // Anzahl der Tage bis die Daten im Storage ablaufen
var relevantInterval = 30; //Zeitfenster in dem Routenanfragen interessant wären in Minuten (Alle Routen innerhalb von X Minuten am Zielort ankommen)
var onlyFastest = false; //Schnellste Anfrage da nur Erste Route angefragt wird

//GLOBAL (vom System geändert werden)
var cors_api_url = 'https://cors-anywhere.herokuapp.com/';
var overpassStops; // Speichert alle Bushaltestellen, getaggt mit name und datum
var overpassRoutes; // Analog mit Routen
var stopDescriptionList; //Nodes die in Start/Stop angezeigt werden mit verknüpften Daten
var relevantRoutes;

var overpassNodes;

var routeNumber = 0; //Zähler für schreiben der Routen


var DataObserver=function (){ //Singleton um sicherzustellen das alle denselben Wert benutzen
    if ( arguments.callee._singletonInstance ){
      return arguments.callee._singletonInstance;
    }
    arguments.callee._singletonInstance = this;

    DataObserver.prototype.activeProcess=0;
    DataObserver.prototype.addProcess= function(){
      console.log("Added Process");
      this.activeProcess++;
    }
    DataObserver.prototype.removeProcess= function(){
      if (this.activeProcess===0){
        console.log("pls add active processes first")
        return;
      }
      console.log("Finished Process");
      this.activeProcess--;
      if (this.activeProcess===0){
        localforage.setItem("routes",relevantRoutes,function(err){
          console.log("Start processData");
          processData();
        })
        
      }
    }
}
var tracker = new DataObserver(); //Erstelle Instanz bzw init Singleton

var map;
// Anpassen sobald nicht mehr in testphase
window.onload = function(){

  loadOverpassData(); //muss bleiben 
 // var testPosLat=50.3611643;
 // var testPosLon=7.5592619;

}



//Helper für das gesamte Dokument
function trim (str) {
  return str.replace(/[\n\r]/g, ' ').replace(/ +/g, ' ').replace(/^\s+/g, '').replace(/\s+$/g, '');
}
 
function switchViewTo(viewname){
  $('.view').each(function(index) {
          if ($(this).attr('id') == viewname) {
              $(this).show();
          } else {
              $(this).hide();
          }
  });
}

//ON BUTTON PRESS
//Schritt 1: Anfrage an Bahn mit Start und Ziel
function getData(start, finish, date){ // Finde mit aktuellem Datum wenn date==null, ansonsten verwende Date

      if (start===null || finish===null){
        console.log("NO INPUT!");
        return;
      }
      relevantRoutes=[];
      routeNumber=0;
      if(date===null){
        date=new Date();
      } 

      //Ausweichanfrage falls EVM Daten nicht vorhanden (aka Fußwegtest) (beachte Datum)
      //var bahnREQ = 'http://mobile.bahn.de/bin/mobil/query.exe/dox?REQ0Tariff_TravellerAge.1=35&REQ0JourneyStopsS0A=1&REQ0JourneyStopsS0G=trier universität mensa&REQ0JourneyStopsS0ID=&REQ0JourneyStopsZ0A=1&REQ0JourneyStopsZ0G=trier%20hbf&REQ0JourneyStopsZ0ID=&start=Suchen&REQ0Tariff_Class=2&REQ0Tariff_TravellerReductionClass.1=0&REQ0JourneyDate=23.12.14&REQ0JourneyTime=14%3A15';
      //Bendorf -> Uni
      //var bahnREQ = 'http://mobile.bahn.de/bin/mobil/query.exe/dox?REQ0Tariff_TravellerAge.1=35&REQ0JourneyStopsS0A=1&REQ0JourneyStopsS0G=winninger str&REQ0JourneyStopsS0ID=&REQ0JourneyStopsZ0A=1&REQ0JourneyStopsZ0G=bendorf schlosspark&REQ0JourneyStopsZ0ID=&start=Suchen&REQ0Tariff_Class=2&REQ0Tariff_TravellerReductionClass.1=0&REQ0JourneyDate=02.01.15&REQ0JourneyTime=14%3A15';
      //Variable Anfrage      
      var bahnREQ = 'http://mobile.bahn.de/bin/mobil/query.exe/dox?REQ0Tariff_TravellerAge.1=35&REQ0JourneyStopsS0A=1&REQ0JourneyStopsS0G='+start.stopname+" "+start.town+'&REQ0JourneyStopsS0ID=&REQ0JourneyStopsZ0A=1&REQ0JourneyStopsZ0G='+finish.stopname+" "+finish.town+'&REQ0JourneyStopsZ0ID=&start=Suchen&REQ0Tariff_Class=2&REQ0Tariff_TravellerReductionClass.1=0&REQ0JourneyDate='+date.getDate()+'.'+(date.getMonth()+1)+'.'+date.getFullYear()+'&REQ0JourneyTime='+date.getHours()+'%3A'+date.getMinutes();
      //Date Test
      //var bahnREQ = 'http://mobile.bahn.de/bin/mobil/query.exe/dox?REQ0Tariff_TravellerAge.1=35&REQ0JourneyStopsS0A=1&REQ0JourneyStopsS0G=winninger str Koblenz&REQ0JourneyStopsS0ID=&REQ0JourneyStopsZ0A=1&REQ0JourneyStopsZ0G=bendorf schlosspark&REQ0JourneyStopsZ0ID=&start=Suchen&REQ0Tariff_Class=2&REQ0Tariff_TravellerReductionClass.1=0&REQ0JourneyDate='+date.getDate()+'.'+(date.getMonth()+1)+'.'+date.getFullYear()+'&REQ0JourneyTime='+date.getHours()+'%3A'+(date.getMinutes()+1);
      
      console.log(bahnREQ);
      doCORSRequestRoute({
        method: 'GET',
        start: start,
        destination: finish,
        url: bahnREQ,
        data: null
      });
    }

//Helper
function doCORSRequestRoute(options) { //async Request
  var x = new XMLHttpRequest();
  x.open(options.method, cors_api_url + options.url);
  x.onload = x.onerror = function(){
    requestLinks(x.responseText,options.start,options.destination);};
  x.send(options.data);
}

function loadOverpassData(){ //Läd nur Stops, da Routen nicht zur Verarbeitung gebraucht werden (werden nur gespeichert)
  localforage.getItem("overpass_stops",function(err, value){
    if (err){
      console.log ("Couldnt get overpass_stops");
    } else{
      if (value === null){
      overpassStops=[];
    } else{
      overpassStops=value;
      for (var i=0; i<overpassStops.length; i++){
        var now = new Date();
        var termination= new Date(overpassStops[i].date);
        if(termination<now){
          //console.log("Removing Position: " + i);
          overpassStops.splice(i,1); //Löschen der Alten Version
          i--;
          }
        }
      }
    }
  });
  
  localforage.getItem("overpass_nodes",function(err, value){
    if (err){
      console.log ("Couldnt get overpass_nodes");
    } else{
      if (value === null){
          overpassNodes=[];
        } else{
          overpassNodes=value;
          for (var n=0; n<overpassNodes.length; n++){
            var now = new Date();
            var termination= new Date(overpassNodes[n].date);
            if(termination<now){
              //console.log("Removing Position: " + n);
              overpassNodes.splice(n,1); //Löschen der Alten Version
              n--;
            }
          }
        }

    }

        });

  localforage.getItem("overpass_routes",function(err, value){
    if (err){
      console.log ("Couldnt get overpass_routes");
    } else{
      if (value === null){
          overpassRoutes=[];
        } else{
          overpassRoutes=value;
          for (var n=0; n<overpassRoutes.length; n++){
            var now = new Date();
            var termination= new Date(overpassRoutes[n].date);
            if(termination<now){
              //console.log("Removing Position: " + n);
              overpassRoutes.splice(n,1); //Löschen der Alten Version
              n--;
            }
          }
        }

    }

  }
  );
}


//Schritt 2: Filtere eigentliche Routen-Links und frage an
function requestLinks(result,start,destination){
        if (result.indexOf("nicht eindeutig")>-1){  //Eingabe nicht eindeutig
          var parser = new DOMParser();
          var html = parser.parseFromString(result,"text/html");
          var startOptionString = JSON.stringify(html.getElementsByName("REQ0JourneyStopsS0K")[0].innerHTML);
          var startOptions=[];
          var beginIndex=0;
          for (var i=0; i<startOptionString.length;i++){
            if(startOptionString[i]==='<'){
              if (beginIndex<(i-3)){ // Haltestelle muss mindestens 3 buchstaben enthalten (\n entfernen)
                startOptions.push(startOptionString.substring(beginIndex,i-1));
                }
              } else if (startOptionString[i]==='>'){
                beginIndex=i+1;
              } 
          }
          if (startOptions.length>0){
            switchViewTo("stopSelection_view");
            $("#stops").empty();

            for (var n=0; n<startOptions.length;n++){
              $("#stops").append("<li><button id='btn"+n+"'>"+startOptions[n]+"</button></li>");
              $("#btn"+n).click(function(){
                  var splitname= $(this).text().split(",");
                  start.stopname=splitname[0];
                  localforage.getItem("favList",function(err,value){
                    var favlist=value;
                    for (var i=0; i<favlist.length;i++){
                      if(favlist[i].reference===start.reference){
                        favlist[i]=start;
                        localforage.setItem("favList",favlist,function(err,value){
                          switchViewTo("route_view");
                        })
                      }
                    }
                  });
                  
                  
              });
            }

            console.log("ERROR - NICHT EINDEUTIG (Starthaltestelle):\n"+JSON.stringify(startOptions));
            return;
          }
          
          var destinationOptionString = JSON.stringify(html.getElementsByName("REQ0JourneyStopsZ0K")[0].innerHTML);
          var destinationOptions=[];
          beginIndex=0;
          for (var i=0; i<destinationOptionString.length;i++){
            if(destinationOptionString[i]==='<'){
              if (beginIndex<(i-3)){ // Haltestelle muss mindestens 3 buchstaben enthalten (\n entfernen)
                destinationOptions.push(destinationOptionString.substring(beginIndex,i-1));
              }
            } else if (destinationOptionString[i]==='>'){
              beginIndex=i+1;
            } 
          }
          if(destinationOptions.length>0){
          switchViewTo("stopSelection_view");
            $("#stops").empty();

            for (var n=0; n<destinationOptions.length;n++){
              $("#stops").append("<li><button id='btn"+n+"'>"+destinationOptions[n]+"</button></li>");
              $("#btn"+n).click(function(){
                  var splitname= $(this).text().split(",");
                  destination.stopname=splitname[0];
                  localforage.getItem("favList",function(err,value){
                    var favlist=value;
                    for (var i=0; i<favlist.length;i++){
                      if(favlist[i].reference===destination.reference){
                        favlist[i]=destination;
                        localforage.setItem("favList",favlist,function(err,value){
                          switchViewTo("route_view");
                        })
                      }
                    }
                  });   
              });
            }

          console.log("ERROR - NICHT EINDEUTIG (Endhaltestelle):\n"+JSON.stringify(destinationOptions));
          return;
          }
          return;
        }


        if (result === null || result ===""){
          console.log("ERROR - SOMETHING WENT WRONG - are you even online\n");  //Handle Error 
          return;
        }
        var parser=new DOMParser();
        var html = parser.parseFromString(result,"text/html");

        for (var i=0; i<5;i++){// Links in der Routen aus Tabelle lesen
            var times=html.getElementsByClassName('timelink').item(i).firstChild.innerHTML.split("<br>");// times[0]=startzeit; times[1]=zielzeit
            var fastestArrival;
            if (i==0){
              fastestArrival = times[1]; //Schnellste Ankunftszeit 
              tracker.addProcess();
              console.log("Request: "+ html.getElementsByClassName('timelink').item(i).firstChild.href + "\n\n");//Log Link URL
                  doCORSRequestData({ //Requests für Links
                  method: 'GET',
                  url: html.getElementsByClassName('timelink').item(i).firstChild.href,
                  data: null
              });
              if (onlyFastest){
                break;
              }
            } else{
              if (isRelevant(fastestArrival,times[1])){
                  tracker.addProcess();
                  console.log("Request: "+ html.getElementsByClassName('timelink').item(i).firstChild.href + "\n\n");//Log Link URL
                  doCORSRequestData({ //Requests für Links
                  method: 'GET',
                  url: html.getElementsByClassName('timelink').item(i).firstChild.href,
                  data: null
                  });
              } else{
                break;
              }
            }

            

        };
        
}

//Helper
function doCORSRequestData(options) { //async Request
  var x = new XMLHttpRequest();
  x.open(options.method, cors_api_url + options.url);
  x.onload = x.onerror = function(){
    htmlToData(x.responseText);};
  x.send(options.data);
}

function isRelevant(fastestTime,compareTime){ //Format der Zeiten HH:MM
  fastestTimeSplit=fastestTime.split(":");
  compareTimeSplit=compareTime.split(":");
  resultSplit=[0,0];
  resultSplit[0]=compareTimeSplit[0]-fastestTimeSplit[0];
  resultSplit[1]=compareTimeSplit[1]-fastestTimeSplit[1];
  //console.log(resultSplit[0]+":"+resultSplit[1]);
  if(resultSplit[1]<0){
    resultSplit[0]--;
    resultSplit[1]+=60;
  } else if(resultSplit[1]>60){
    resultSplit[0]++;
    resultSplit[1]-=60;
  }
  if (resultSplit[0]>23){
    resultSplit[0]-=24
  } else if (resultSplit[0]<0){
    resultSplit[0]+=24
  }
  console.log(compareTime+" - "+fastestTime+" = "+resultSplit[0]+":"+resultSplit[1]);
  if ((resultSplit[0]===0) && (resultSplit[1]<=relevantInterval)){
    return true;
  }
  return false;
}


//Schritt 3: Filtere brauchbare Informationen und speichere
function htmlToData(resultLinks){
  var parser=new DOMParser();
  var htmlLinks = parser.parseFromString(resultLinks,"text/html");

  var stopAndTimeTags = htmlLinks.getElementsByClassName("stationDark"); //Alle Tags mit Bus
  var busNrTags = htmlLinks.getElementsByClassName("mot");
  
  var busNr = [];
  var stops=[];
  var times=[]; // Alle Zeiten, Reihenfolge [ab,an,ab,an,ab,...,an]

  filterBusNr (busNr, busNrTags);
  filterStopAndTimes(stopAndTimeTags,stops,times);

  // Haltestelle Teste gesamt Teil -> kein Treffer? -> teste Teil ohne Erstes Wort (funktioniert meistens da zb Metternich Oberweiher(Uni) {wobei diese Haltestelle problematisch ist})
  var routesObject = Object();
  routesObject.route=[];

  buildRouteObject(busNr,stops,times,routesObject);

  console.log("route"+routeNumber+" : "+JSON.stringify(routesObject) + "\n\n"); //JSON Object log
  relevantRoutes.push(routesObject);
  tracker.removeProcess();
  routeNumber++;
  
  
  
}

//Helper

function filterBusNr (busNr, busNrTags){
  for (var n=0; n<busNrTags.length;n++ ){
    var temp=trim(busNrTags.item(n).textContent);
    if(temp.indexOf("Bus ")>-1){
      temp=trim(temp.substring(4,temp.length));
    }
    busNr.push(temp);
  }
}

function filterStopAndTimes(stopAndTimeTags,stops,times){ //MEMO: javascript verändert direkt den Variablenwert von stops/times
  for (var k = 0; k < stopAndTimeTags.length; k++) { //Entferne Formatierungen aus Haltestelle und Zeiten, Sortiere
    var stopAndTime=stopAndTimeTags.item(k).textContent.split("\n").filter(function(n){ return n != "" });
    for (var l=0; l<stopAndTime.length;l++){
      var temp=trim(stopAndTime[l]); //Formatieren und Sotieren
      if ((temp.indexOf("an ") === 0) || (temp.indexOf("ab ") === 0)){
        times.push(temp.substring(3,temp.length));
      }else if(temp.indexOf(" Min.")> -1){ 
        times.push(temp);
        times.push("undefined (Fußweg)"); //Filler, sodass man immer Zahlenpaar abfragen kann
      }else{
        stops.push(temp);
      }
    }
    
  }
}

//Schritt 3.1: Baue das Routen-Objekt
function buildRouteObject(busNr,stops,times,routesObject){
  var coordinatesContainer=[];
  for (var i=0; i<busNr.length;i++){
    
    var filteredStop0= filterDistricts(stops[i]);
    var townNames0 = getTownNames(filteredStop0); //Mögliche TownNamen für Overpass-Query
    var stopNames0 = getStopNames(filteredStop0,townNames0); //Mögliche StopNamen für Overpass-Query
    coordinatesContainer[0] = getLongLat(stopNames0,townNames0,busNr[i]);

    var filteredStop1= filterDistricts(stops[i+1]);
    var townNames1 = getTownNames(filteredStop1); //Mögliche TownNamen für Overpass-Query
    var stopNames1 = getStopNames(filteredStop1,townNames1); 
    coordinatesContainer[1] = getLongLat(stopNames1,townNames1,busNr[i]);


    if(i==0){
      routesObject.route.push(buildJsonSection(busNr[0],stops[0],stops[1],times[0],times[1],coordinatesContainer[0],coordinatesContainer[1]));
    } else{
      routesObject.route.push(buildJsonSection(busNr[i],stops[i],stops[i+1],times[2*i],times[2*i+1],coordinatesContainer[0],coordinatesContainer[1]));
    }
    
  }
}

//Helper


function filterDistricts(stopName){

      //console.log("Start Filtering: " + stopName+"\n");
      var ret = stopName;
      var lowerCaseStop = stopName.toLowerCase();

      //stadtteile ist eine Variable aus stadtteile.js (2066 sortierte Stadtteilnamen im lowercase))
     
      for (var n=0; n<stadtteile.length;n++){
       // Wahrscheinlich schnelleres suchverfahren
        if (lowerCaseStop.indexOf(stadtteile[n] + " ") === 0){
          ret= trim(stopName.replace(stopName.substr(0,stadtteile[n].length),"")); //Streiche Stadteil
          //console.log("HIT (1): "+stadtteile[n] +"\n");
          //console.log("Finished:"+ stopName + "->" + ret +"\n");
          return ret;
        } else if(lowerCaseStop.indexOf("-" + stadtteile[n]) > -1){
          ret= trim(stopName.replace(stopName.substr(lowerCaseStop.indexOf("-" + stadtteile[n]),("-"+stadtteile[n]).length),"")); //Streiche Stadteil
          //console.log("HIT (2): "+stadtteile[n] +"\n");
          //console.log("Finished:"+ stopName + "->" + ret+"\n");
          return ret;
        }

      }
      //console.log("NOHIT"+"\n");
      //console.log("Finished:"+ stopName + "->" + ret+"\n");
      return ret;
}

function buildJsonSection(busNr,stopStart,stopEnd,timeArrival,timeDepart,coordinatesStart,coordinatesEnd){
    var newSec = new Object();
    newSec.routeName = busNr;

    var start = new Object();
    start.name=stopStart;
    start.coordinates=coordinatesStart;

    var end = new Object();
    end.name=stopEnd;
    end.coordinates=coordinatesEnd;
    
    newSec.stops = [start,end];
    newSec.times = [timeArrival,timeDepart];
    return newSec;

}

//Schritt 3.1a: Konstruiere mögliche Stadtnamen aus DB-Response

function getTownNames(stopName){
  //Teile Stadt und Haltestellen Name
  var startTown = stopName.lastIndexOf(",")+1;
  var townNames = [];
  if(startTown == 0){ //Rate Erste/ersten Beiden
    //console.log("TownName: Case no ','\n");
    var stopNameSplits = stopName.split(" ");
    townNames.push(stopNameSplits[0]);
    //townNames.push(stopNameSplits[0]+" "+stopNameSplits[1]); // Würde Städte wie Bad Kreuznach etc. abdecken, steigert aber durch "area[name~'XYZ|XYZ ZYX']" die rechendauer
    //ggf mit Ausnahmenregeln lösen bsp. "Bad "-> nimm auch nächstes Wort 
  }else{
    if (stopName.substring(startTown).indexOf("(") != -1){ //wenn Name Zusatz enthält -> Streichen
      //console.log("TownName: Case ',' and '('\n");
      townNames.push(trim(stopName.substring(startTown,stopName.indexOf("(")))); 
    } else {
      //console.log("TownName: Case ','\n");
      townNames.push(trim(stopName.substring(startTown)));
    }
  }
  return townNames;
}

//Schritt 3.1b: Konstruiere mögliche Stopnamen aus DB-Response

function getStopNames(stopName, townNames){   
  var stopNames=[];
  var temp=stopName.replace(",","");
  for (var i=0; i<townNames.length;i++){
    var ret=temp.replace(townNames[i],"");
    while (ret.indexOf("(")>-1){
      var bracketsStart = ret.indexOf("(");
      var bracketsEnd = ret.indexOf(")");
      ret=ret.replace(ret.substring(bracketsStart,bracketsEnd+1),"");
    }
    //console.log("Stopname: "+ ret);
    stopNames.push(trim(ret));
  }
  return stopNames;
}

//Schritt 3.1c: Finde Koordinaten bei Overpass

function getLongLat(stopNames, townNames, routeNr){ //Läd wenn notwendig Koordinaten von Overpass
  if ((routeNr ==="Fußweg") || (routeNr.indexOf("RB")>-1) || (routeNr.indexOf("RE")>-1) || (routeNr.indexOf("IC")>-1 || (routeNr.indexOf("ICE")>-1))){
    return [];
  }
  var townQuery=townNames[0]; 
  for (var t=1; t<townNames.length;t++){
    if (townNames[t] != ""){
      townQuery=townQuery.concat("|"+townNames[t]);
    }    
  }
  var stopQuery=stopNames[0];
  for (var s=1; s<stopNames.length;s++){
    if (stopNames[s] != ""){
    stopQuery=stopQuery.concat("|"+stopNames[s]);
    }
  }
  var request="[out:json];area[name='"+townQuery+"'];rel(area)[type=route][route=bus];out;>;out;"; // Alle Routen mit Haltestellen etc
  var query='http://overpass-api.de/api/interpreter?data='+request; //Hänge Request an
  //console.log("TownQuery: " + townQuery+"\n");
  //console.log("StopQuery: " + stopQuery+"\n");
  var index = overpassStopsContainsName(townQuery);
  //console.log("Index in Stored Data: "+index + "\n");
  if(index > -1){ //Schon gespeichert?
    var elements=overpassStops[index].elements;  
  } else {  // Lade
    //console.log("Initially load: "+townQuery);
    var checkVar = false;
    var x = new XMLHttpRequest();
    x.open('GET', query,false); //sync Request -> Daten direkt nutzbar (dafür wartet alles auf resonse) <- sollte verbessert werden
    x.send(null);
    //console.log("Finished loading");

    var obj = JSON.parse(x.responseText);
    var elements = obj.elements;
    var termination= new Date();
    termination.setDate(termination.getDate()+terminationInterval); //Setze Ablaufdatum 
    storeInOverpassData(townQuery, termination.toDateString(), elements);
  }

  var coordinatesList =  buildCoordinatesList(elements,stopNames,townQuery,routeNr);
  return coordinatesList;
}

//Helper

function buildCoordinatesList(elements,stopNames,townName,routeNr){
  var coordinatesList = []; //Hole nur Koordinaten
  var route=null;
  loop:
  for (var k=0;k<overpassRoutes.length;k++){
    if (overpassRoutes[k].town===townName){
      
      var townRoutes=overpassRoutes[k].elements; // Finde alle Routen
      for (var l=0; l<townRoutes.length; l++){
        //console.log(JSON.stringify(townRoutes[l].tags));
        if (townRoutes[l].type != "relation"){
          break;
        }
        if (townRoutes[l].tags.ref===routeNr){
          route=townRoutes[l];   
          break loop;
        }
        
      }
      console.log("Busline not found: "+routeNr+ " in " + townName); // auf Linien wie 3/13 anpassen
    }
  }

  for (var i=0; i<elements.length;i++){ 
    if(elements[i].tags !=null){
      if (elements[i].tags.name != null){ // Bricht sonst ohne Fehlermeldung ab
        if(elements[i].tags.name.indexOf(stopNames[0]) > -1){   // TEST AUF NUR ERSTE WAHL STOP NAME (MUSS BEI MEHR ALTERNATIVEN GEFIXED WERDEN)
          if ((elements[i].lon != null) && (elements[i].lat != null)){
              if (route==null){ // Keine passenede Route -> nimm alle Koordinaten
                var coordinates=new Object();
                coordinates.lon=elements[i].lon;
                coordinates.lat=elements[i].lat;
                //console.log(stopNames[0]+" -> "+elements[i].tags.name+ "\n");
                coordinatesList.push(coordinates);
              } else{ //Ansonsten filtere
                    for (var n=0; n<route.members.length; n++){
                      if (route.members[n].ref===elements[i].id){
                        var coordinates=new Object();
                        coordinates.lon=elements[i].lon;
                        coordinates.lat=elements[i].lat;
                        //console.log(stopNames[0]+" -> "+elements[i].tags.name+ "\n");
                        coordinatesList.push(coordinates);
                      }
                    }
                }
              }       
          }       
        }
      }
    }
  return coordinatesList;
}

function overpassStopsContainsName(town){ //returns Index
  var ret=-1;
  for (var i=0; i<overpassStops.length;i++){
    //console.log(overpassStops[i].town+ "==" +town +"?\n");
    if(overpassStops[i].town === town){
      //console.log("TOWN ALREADY STORED\n");
      ret=i;
      break;
    }
  }
  return ret;
}


//Wenn nicht in gespeicherten Dateien, speichere
function storeInOverpassData(town, date, elements){
      
      var storeRoutes = false; //Nodes and Routes gekoppelt
      var storeStops = false;

      if (overpassRoutes.length === 0){
        storeRoutes=true;
        //console.log("AllOWED TO STORE ROUTE (Initial): "+town); 
      } else {
        for (var i=0; i<overpassRoutes.length;i++){
          if (overpassRoutes[i].town != null){ // Bricht sonst ohne Fehlermeldung ab
            if(overpassRoutes[i].town.indexOf(town) != 0){   // Test ob Routen der Stadt schon gespeichert
              storeRoutes=true;
              //console.log("AllOWED TO STORE ROUTE: "+town);
            }
          }
        }
      }
      if (overpassStops.length === 0){
        storeStops=true;
        //console.log("AllOWED TO STORE STOPS (Initial): "+town);
      } else{
        for (var n=0; n<overpassStops.length;n++){
          if (overpassStops[n].town != null){ // Bricht sonst ohne Fehlermeldung ab
            if(overpassStops[n].town.indexOf(town) != 0){   // Test ob Stops der Stadt schon gespeichert
              storeStops=true;
              //console.log("AllOWED TO STORE STOPS: "+town);
            }
          }
        }

      }
      
      //Filtere Stops und Routen
      var routes = [];
      var stops = [];
      var nodes = [];

      // Switch Case für alles was gespeichert werden muss (viel Code aber eigentlich wenige Unterschiede, minimiert aber Aufwand)
      if (storeStops && storeRoutes){ //Beide
        //console.log("Trying to store stops and routes");
        for (var k=0; k<elements.length; k++){
          if (elements[k].type === "node"){
            nodes.push(elements[k]); //Pro Stadt sortiert!!!
          }
          if (elements[k].type === "relation" || elements[k].type === "way"){ //Relation+Way -> Route
            //console.log("PUSHED ROUTE: " + elements[k].tags.name);
            routes.push(elements[k]);
          }else if (elements[k].tags != null){
            if((elements[k].tags.highway === "bus_stop")||(elements[k].tags.amenity === "bus_station")||(elements[k].tags.public_transport === "platform")){
              //console.log("PUSHED STOP: " + elements[k].tags.name);
              stops.push(elements[k]);
            }
          }
        }
        var obj1 = new Object();
        obj1.town=town;
        obj1.date=date;
        obj1.elements=stops;

        overpassStops.push(obj1);
        localforage.setItem("overpass_stops",overpassStops,function(err){
        });

        var obj2 = new Object();
        obj2.town=town;
        obj2.date=date;

        obj2.elements=routes;
        overpassRoutes.push(obj2);
        
        localforage.setItem("overpass_routes",overpassRoutes,function(err){
        });

        var obj3 = new Object();
        obj3.town=town;
        obj3.date=date;

        obj3.elements=nodes;
        overpassNodes.push(obj3);
        localforage.setItem("overpass_nodes",overpassNodes,function(err){
        });
      } 
      else if (!storeStops && storeRoutes){ //Nur Routes
        //console.log("Trying to store routes");
        for (var k=0; k<elements.length; k++){
          if (elements[k].type === "node"){
            nodes.push(elements[k]); //Pro Stadt sortiert
          }
          if (elements[k].type === "relation"|| elements[k].type === "way"){ //Relation -> Route
              routes.push(elements[k]);
            }
          }
          var obj = new Object();
          obj.town=town;
          obj.date=date;
          obj.elements=routes;
          overpassRoutes.push(obj);
          localforage.setItem("overpass_routes",overpassRoutes,function(err){
          });

          var obj2 = new Object();
          obj2.town=town;
          obj2.date=date;

          obj2.elements=nodes;
          overpassNodes.push(obj2);
          localforage.setItem("overpass_nodes",overpassNodes,function(err){
          });
      }
      else if (storeStops && !storeRoutes){// Nur Stops
        //console.log("Trying to store stops");
        for (var k=0; k<elements.length; k++){
        if (elements[k].tags != null){
            if((elements[k].tags.highway === "bus_stop")||(elements[k].tags.amenity === "bus_station")||(elements[k].tags.public_transport === "platform")){
              stops.push(elements[k]);
            }
          }
        }
        var obj = new Object();
        obj.town=town;
        obj.date=date;
        obj.elements=stops;
        overpassStops.push(obj);
        localforage.setItem("overpass_stops",overpassStops,function(err){
        });
      } 
      
  }


//Schritt 4 - verarbeite Daten 

function processData(){
  //------------- PLACEHOLDER --------------------

  // TODO work work work
	console.log("Process Data!");
  //loadMap(0); //vorest zeige erstbeste Route
}

//Schritt 5 - stelle Route auf Karte dar
//FIX CODE HADOUKEN!!
function loadMap(index){ //index der Route die dargestellt werden soll
  localforage.getItem("route"+index,function(err, value){
    if (err){
      console.log ("Couldnt load route");
    } else{
      var lon=value.route[0].stops[0].coordinates[0].lon;
      var lat=value.route[0].stops[0].coordinates[0].lat;
      
      map.setView(new L.LatLng(lat,lon),20);
      for (var i=0;i<value.route.length;i++){
        //Finde Stadt in der die Route läuft
        var filteredStop= filterDistricts(value.route[i].stops[0].name); 
        var townNames = getTownNames(filteredStop); //Unperformant!!! verbessern
        for (var n=0;n<overpassRoutes.length;n++){
          //finde Route -> finde ways zu refs in relation -> zeichne ein
          if (overpassRoutes[n].town===townNames[0]){
            for (var m=0;m<overpassRoutes[n].elements.length;m++){
              if(overpassRoutes[n].elements[m].tags!=null){
                if(overpassRoutes[n].elements[m].tags.ref===value.route[i].routeName){
                  //Route gefunden
                  for (var r=0;r<overpassRoutes[n].elements[m].members.length;r++){
                    if (overpassRoutes[n].elements[m].members[r].type === "way"){
                      var ref = overpassRoutes[n].elements[m].members[r].ref;
                      // Suche Weg Nodes
                      for (var q=m+1;q<overpassRoutes[n].elements.length;q++){
                        if(overpassRoutes[n].elements[q].type==="way"){
                          if(overpassRoutes[n].elements[q].id===ref){
                            //Weg Nodes gefunden
                            var nodeList=overpassRoutes[n].elements[q].nodes;
                            //finde nodes in Overpass Nodes -> Baue Koordinaten Liste -> Draw
                            var wayCoordinates=[];
                            for (var u=0; u<nodeList.length;u++){
                              var node=nodeList[u];
                              for (var s=0; s<overpassNodes.length; s++){
                                if (overpassNodes[s].town===townNames[0]){ //Besseres Suchverfahren -> verbesserbar
                                  for (var t=0; t<overpassNodes[s].elements.length;t++){
                                    if (overpassNodes[s].elements[t].id===node){
                                      //add Coordinates
                                      var coordinates= new Array();
                                      coordinates[0]=overpassNodes[s].elements[t].lat;
                                      coordinates[1]=overpassNodes[s].elements[t].lon;
                                      wayCoordinates.push(coordinates);
                                      break;
                                    }else if(overpassNodes[s].elements[t].id>node){
                                      break;
                                    }
                                  }
                                 
                                }
                              }
                            }
                            
                            var polyline=L.polyline(wayCoordinates).addTo(map);
                            break;
                          } else if (overpassRoutes[n].elements[q].id>ref){
                            break;
                          }
                        }
                      }
                  
                    }
                  }
                  
                }
              } else if (overpassRoutes[n].elements[m].type!="relation"){
                break;
              }

            }
          } 
          


        }
        //Set Marker
        for (var j=0;j<value.route[i].stops.length;j++){
          for (var k=0;k<value.route[i].stops[j].coordinates.length;k++){
            var lon=value.route[i].stops[j].coordinates[k].lon;
            var lat=value.route[i].stops[j].coordinates[k].lat;
            var marker = L.marker([lat,lon]).addTo(map);
          }
        }
      }
    }
  });


  
}
