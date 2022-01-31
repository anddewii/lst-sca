///////////////////////////////////Estimation LST and UHI Using Single-Channel Algorithm (SCA) Method and Landsat 7/////////////////////////////////////////

//add shp
var shp_bekasi = ee.FeatureCollection(shp)

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////CLOUD MASK//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var MaskL7  = function(image) {
  var qa = image.select('BQA');
  var mask = qa.bitwiseAnd(1 << 4).eq(0);
  return image.updateMask(mask);
};

// Cloud mask for Landsat 7 SR
var MaskL7sr = function(image) {
  var qa = image.select('pixel_qa');
  // If the cloud bit (5) is set and the cloud confidence (7) is high
  // or the cloud shadow bit is set (3), then it's a bad pixel.
  var cloud = qa.bitwiseAnd(1 << 5)
                  .and(qa.bitwiseAnd(1 << 7))
                  .or(qa.bitwiseAnd(1 << 3));
  // Remove edge pixels that don't occur in all bands
  var mask2 = image.mask().reduce(ee.Reducer.min());
  return image.updateMask(cloud.not()).updateMask(mask2);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////ADD IMAGE//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////Add landsat 7 tahun 2010 (For LST)
var l7data_10 = ee.ImageCollection(l7)
                  .filterBounds(shp)
                  .filterDate('2010-05-01', '2010-10-31')
                  .filterMetadata('CLOUD_COVER', 'less_than', 50);
                
print(l7data_10);

var l7d_10 = ee.Image('LANDSAT/LE07/C01/T1_RT/LE07_122064_20100521')
.clip(shp);

//Display all metadata.
print('All metadata:', l7d_10);

var l7_10 = ee.ImageCollection(l7d_10)  
 .filterBounds(shp)
 .map(MaskL7)
 .select('B6_VCID_2')
 .mean()
 .clip(shp);

// Display all metadata.
//print('All metadata:', l7d_101);

var visualization = {
  min: 0.0,
  max: 30000.0,
  bands: ['B6_VCID_2'],
}; 
 
//Map.addLayer(l7_10, visualization, 'landsat_2010');

//////////////////FILL GAP L7
var l710_fill = l7_10.focal_mean(1, 'square', 'pixels', 30);
var l710_final = l710_fill.blend(l7_10);

//Map.addLayer(img_fill05.clip(shp), visualization, 'Image Fill')
//Map.addLayer(l710_final, visualization, 'Final Image10')

//DATA L7 FINAL
var l7_10f = ee.ImageCollection(l710_final)  
 .filterBounds(shp)
 .select('B6_VCID_2');

//////////////////////Add landsat 7 tahun 2005 (For LST)
var l7data_05 = ee.ImageCollection(l7)
                  .filterBounds(shp)
                  .filterDate('2005-06-01', '2005-10-31')
                  .filterMetadata('CLOUD_COVER', 'less_than', 30);
print(l7data_05, '2005');

var l7d_05 = ee.Image('LANDSAT/LE07/C01/T1_RT/LE07_122064_20050710')
.clip(shp);
            
var l7_05 = ee.ImageCollection(l7d_05)  
 .filterBounds(shp)
 .map(MaskL7)
 .select('B6_VCID_2')
 .mean()
 .clip(shp);

//Map.addLayer(l7_05, visualization, 'landsat_2005');

//////////////////FILL GAP L7
var l705_fill = l7_05.focal_mean(1, 'square', 'pixels', 30);
var l705_final = l705_fill.blend(l7_05);

//Map.addLayer(img_fill05.clip(shp), visualization, 'Image Fill');
//Map.addLayer(l705_final, visualization, 'Final Image05');

//DATA L7 FINAL
var l7_05f = ee.ImageCollection(l705_final)
 .filterBounds(shp)
 .select('B6_VCID_2');
 
//////////////////////Add landsat 7 tahun 2000 (For LST)
var l7data_00 = ee.ImageCollection(l7)
                  .filterBounds(shp)
                  .filterDate('2000-06-01', '2000-10-31')
                  .filterMetadata('CLOUD_COVER', 'less_than', 30);
                
print(l7data_00, '2000');

var l7d_00 = ee.Image('LANDSAT/LE07/C01/T1_RT/LE07_122064_20000914')
.clip(shp);
            
var l7_00 = ee.ImageCollection(l7d_00)  
 .filterBounds(shp)
 .map(MaskL7)
 .select('B6_VCID_2')
 .mean()
 .clip(shp);

//Map.addLayer(l7_00, visualization, 'landsat_2000');

//////////////////FILL GAP L7
var l700_fill = l7_00.focal_mean(1, 'square', 'pixels', 30);
var l700_final = l700_fill.blend(l7_00);

//Map.addLayer(l700_final, visualization, 'Final Image00')

//DATA L7 FINAL
var l7_00f = ee.ImageCollection(l700_final)  
 .filterBounds(shp)
 .select('B6_VCID_2');
 

////////////////////////////////////////Landsat 7 SR//////////////////////////////////////////////////////
//////////////////////Add landsat 7 Surface Reflectance tahun 2010(For NDVI)
var l7data_10sr = ee.ImageCollection(L7sr)
                  .filterBounds(shp)
                  .filterDate('2010-06-01', '2010-10-31')
                  .filterMetadata('CLOUD_COVER', 'less_than', 50);
                  
print(l7data_10sr);   

var l7sr_10sr = ee.Image('LANDSAT/LE07/C01/T1_SR/LE07_122064_20100521')
            .clip(shp);
        

var l7_10sr = ee.ImageCollection(l7sr_10sr)
.map(MaskL7sr)
.mean()
.clip(shp);

var l710sr_fill = l7_10sr.focal_mean(1, 'square', 'pixels', 30);

var l710sr_final = l710sr_fill.blend(l7_10sr);

//Map.addLayer(img_fill05.clip(shp), visualization, 'Image Fill')
//Map.addLayer(l705_final.clip(shp), visualization, 'Final Image10')

//////////////////////Add landsat 7 Surface Reflectance tahun 2005(For NDVI)
var l7data_05sr = ee.ImageCollection(L7sr)
                  .filterBounds(shp)
                  .filterDate('2005-06-01', '2005-10-31')
                  .filterMetadata('CLOUD_COVER', 'less_than', 30);
                  
print(l7data_05sr, '2005');   
var l7d_05sr = ee.Image('LANDSAT/LE07/C01/T1_SR/LE07_122064_20050710')
            .clip(shp);
        

var l7_05sr = ee.ImageCollection(l7d_05sr)   
.mean()
.clip(shp);


var l705_fillsr = l7_05sr.focal_mean(1, 'square', 'pixels', 30);

var l705sr_final = l705_fillsr.blend(l7_05sr);

//Map.addLayer(img_fill05.clip(shp), visualization, 'Image Fill')
//Map.addLayer(l705_final.clip(shp), visualization, 'Final Image05')

//////////////////////Add landsat 7 Surface Reflectance tahun 2000(For NDVI)
var l7data_00sr = ee.ImageCollection(L7sr)
                  .filterBounds(shp)
                  .filterDate('2000-06-01', '2000-09-30')
                  .filterMetadata('CLOUD_COVER', 'less_than', 30);
                  
print(l7data_00sr, '2000'); 

var l7dsr_00 = ee.Image('LANDSAT/LE07/C01/T1_SR/LE07_122064_20000914')
            .clip(shp);
        

var l7_00sr = ee.ImageCollection(l7dsr_00)   
.mean()
.clip(shp);


var l700_fillsr = l7_00sr.focal_mean(1, 'square', 'pixels', 30);

var l700sr_final = l700_fillsr.blend(l7_00sr);

//Map.addLayer(l700sr_final.clip(shp), visualization, 'Final Image00')

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////SET PALLATE//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var palette = ['2900FF','001DFF','005DFF','009DFF','00E5FF','00FFD4',
'00FFCB','00FF86','00FF3F','04FF00','5AFF00','B7FF00',
'DBFF00','FFEF00','FFD600','FFBA00','FF9C00','FF7C00',
'#FF6E00','#FF4800','#FF2200','#FF0000','7D0000','230000']


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////LST 2010//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



///////////////////////////////////Convert DN To RADIANCE and BT///////////////////////////////////
//DN TO RADIANCE  = Ml*Qcal+Al (0.03720*B6+3.16280)
var BTCelcius = l7_10f .map(function(img){
  var id= img.id();
  return img.expression ('((1282.709/(log(666.09/(0.03720*B6+3.16280)+1)))-272.15)'
,{'B6':img.select('B6_VCID_2')})
  .rename('B10_15')
  .copyProperties (img, ['system:time_start'])
});

var BT = BTCelcius.mean().clip(shp);


/////////////////////////////////////////NDVI/////////////////////////////////////////
var ndvi10 = l710sr_final.normalizedDifference(['B4', 'B3']).rename('NDVI10');

//min max 
{
var min_10 = ee.Number(ndvi10.reduceRegion({
reducer: ee.Reducer.min(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(min_10, 'min_2010');

var max_10 = ee.Number(ndvi10.reduceRegion({
reducer: ee.Reducer.max(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(max_10, 'max_2010');
}

//////////////////////////////////////////Pv//////////////////////////////////////////
var Pv_olah =((ndvi10).subtract(min_10))
                .divide(max_10.subtract(min_10));
var Pv = Pv_olah.pow(ee.Number(2));              
                

/////////////////////////////////////Emisivitas (e)///////////////////////////////////
// Land Surface Emissivity (ԑ)= Ev*Pv+Es(1-Pv)
var e1 = ee.Image(0.985);  // Ev
var e2 = (ee.Image(e1).multiply(Pv)); // ev*Pv
var e3 = (ee.Image(1).subtract(Pv)); // (1-Pv)
var e4 = (ee.Image(0.978).multiply(e3)); // es*(1-Pv), es=0.978
var e = (ee.Image(e2).add(e4));


/////////////////////////////////////ESTIMASI LST///////////////////////////////////////////////
//Menghitung Land Surface Temperature (LST)
var logE = e.log();
var p = ee.Image(14388);
// calculate LST = BT/[1+(ʎ*BT/p)*In(e)]
var LST1 = ((ee.Image(11.45).multiply(BT)).divide(p)); // (ʎ*BT/p) //ʎ B10= 11.45
var LST2 = LST1.multiply(logE); // (ʎ*BT/p)*In(e)
var LST3 = (ee.Image(1).add(LST2)); //1+(ʎ*BT/p)*In(e)
var Final_LST = ((BT).divide(LST3)).rename('LST10'); // BT/[1+(ʎ*BT/p)*In(e)]

var LST = Final_LST.clip(shp);

Map.addLayer( LST, {
  min: 0, max: 50,
  palette: palette},
  'LST 2015');
  
//min, max, mean, stdev LST
{
var minLST_10 = ee.Number(LST.reduceRegion({
reducer: ee.Reducer.min(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(minLST_10, 'minLST_2010');

var maxLST_10 = ee.Number(LST.reduceRegion({
reducer: ee.Reducer.max(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(maxLST_10, 'maxLST_2010');

var meanLST_10 = ee.Number(LST.reduceRegion({
reducer: ee.Reducer.mean(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(meanLST_10, 'meanLST_10');

var stdevLST_10 = ee.Number(LST.reduceRegion({
reducer: ee.Reducer.stdDev(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(stdevLST_10, 'stdevLST_10');
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////UHI 2010//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////Daerah UHI dan Non UHI
///Ambang batas UHI (T > μ + 0,5α)

var aUHI_10 = ((ee.Image(0.5).multiply(stdevLST_10))); // μ + 0,5α
var ambangbatasUHI_10 = ((ee.Image(meanLST_10).add(aUHI_10))); //μ + 0,5α
print(ambangbatasUHI_10, 'ambang batas UHI_10') 
//ambang batas UHI 2010 = 26,93

//Reclassify UHI Clas
var UHIclass10 = ee.Image(1)
          .where(LST.gt(19.51).and(LST.lte(26.93)), 1)
          .where(LST.gt(26.94).and(LST.lte(36.24)), 2);
          
Map.addLayer(UHIclass10.clip(shp), {min: 1, max: 2, palette: ['black', 'red']}, 'UHI 10');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////LST 2005//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////Convert DN To RADIANCE and BT///////////////////////////////////
//DN TO RADIANCE = Ml*Qcal+Al (0.03720*B6+3.16280)
var BTCelcius05 = l7_05f .map(function(img){
  var id= img.id();
  return img.expression ('((1282.709/(log(666.09/(0.03720*B6+3.16280)+1)))-272.15)'
,{'B6':img.select('B6_VCID_2')})
  .rename('B10_05')
  .copyProperties (img, ['system:time_start']);
});

var BT05 = BTCelcius05.mean().clip(shp);

/////////////////////////////////////////NDVI/////////////////////////////////////////
var ndvi05 = l705sr_final.normalizedDifference(['B4', 'B3']).rename('NDVI105');

//min max 
{
var min_05 = ee.Number(ndvi05.reduceRegion({
reducer: ee.Reducer.min(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(min_05, 'min_2005');

var max_05 = ee.Number(ndvi05.reduceRegion({
reducer: ee.Reducer.max(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(max_05, 'max_2005');
}

//////////////////////////////////////////Pv//////////////////////////////////////////
var Pv_olah05 =((ndvi05).subtract(min_05))
                .divide(max_05.subtract(min_05));
var Pv05 = Pv_olah05.pow(ee.Number(2));              
                

/////////////////////////////////////Emisivitas (e)///////////////////////////////////
// Land Surface Emissivity (ԑ)= Ev*Pv+Es(1-Pv)
////Ref = Sobrino, 2001
var e1_05 = ee.Image(0.985);  // Ev
var e2_05 = (ee.Image(e1_05).multiply(Pv05)); // ev*Pv
var e3_05 = (ee.Image(1).subtract(Pv05)); // (1-Pv)
var e4_05 = (ee.Image(0.978).multiply(e3_05)); // es*(1-Pv), es=0.978
var e05 = (ee.Image(e2_05).add(e4_05));



/////////////////////////////////////ESTIMASI LST///////////////////////////////////////////////
//Menghitung Land Surface Temperature (LST)
var logE05 = e05.log();
var p05 = ee.Image(14388);
// calculate LST = BT/[1+W*(BT/p)*In(e)]
var LST1_05 = ((ee.Image(11.45).multiply(BT05)).divide(p05)); 
var LST2_05 = LST1_05.multiply(logE05); 
var LST3_05 = (ee.Image(1).add(LST2_05)); 
var Final_LST05 = ((BT05).divide(LST3_05)).rename('LST05'); 

var LST_05 = Final_LST05.clip(shp);

Map.addLayer( LST_05, {
  min: 0, max:50,
  palette: palette},
  'LST 2005');
  
//min, max, mean, stdev LST
{
var minLST_05 = ee.Number(LST_05.reduceRegion({
reducer: ee.Reducer.min(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(minLST_05, 'minLST_2005');

var maxLST_05 = ee.Number(LST_05.reduceRegion({
reducer: ee.Reducer.max(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(maxLST_05, 'maxLST_2005');

var meanLST_05 = ee.Number(LST_05.reduceRegion({
reducer: ee.Reducer.mean(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(meanLST_05, 'meanLST_05');

var stdevLST_05 = ee.Number(LST_05.reduceRegion({
reducer: ee.Reducer.stdDev(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(stdevLST_05, 'stdevLST_05');
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////UHI 2005//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////Daerah UHI dan Non UHI
///Ambang batas UHI (T > μ + 0,5α)

var aUHI_05 = ((ee.Image(0.5).multiply(stdevLST_05))); // μ + 0,5α
var ambangbatasUHI_05 = ((ee.Image(meanLST_05).add(aUHI_05))); //μ + 0,5α
print(ambangbatasUHI_05, 'ambang batas UHI_05')

//ambang batas UHI 2005 = 26.32

//Reclassify UHI Clas
var UHIclass05 = ee.Image(1)
          .where(LST_05.gt(17.43).and(LST_05.lte(24.28)), 1)
          .where(LST_05.gt(24.29).and(LST_05.lte(30.46)), 2);
          
Map.addLayer(UHIclass05.clip(shp), {min: 1, max: 2, palette: ['black', 'red']}, 'UHI 05');


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////LST 2000//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////Convert DN To RADIANCE and BT///////////////////////////////////
//DN TO RADIAN = Ml*Qcal+Al (0.03720*B6+3.16280)
var BTCelcius00 = l7_00f .map(function(img){
  var id= img.id();
  return img.expression ('((1282.709/(log(666.09/(0.03720*B6+3.16280)+1)))-272.15)'
,{'B6':img.select('B6_VCID_2')})
  .rename('B10_05')
  .copyProperties (img, ['system:time_start']);
});


var BT00 = BTCelcius00.mean().clip(shp);

/////////////////////////////////////////NDVI/////////////////////////////////////////
var ndvi00 = l700sr_final.normalizedDifference(['B4', 'B3']).rename('NDVI100');

//min max 
{
var min_00 = ee.Number(ndvi00.reduceRegion({
reducer: ee.Reducer.min(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(min_00, 'min_2000');

var max_00 = ee.Number(ndvi00.reduceRegion({
reducer: ee.Reducer.max(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(max_00, 'max_2000');
}

//////////////////////////////////////////Pv//////////////////////////////////////////
var Pv_olah00 =((ndvi00).subtract(min_00))
                .divide(max_00.subtract(min_00));
var Pv00 = Pv_olah00.pow(ee.Number(2));              
                

/////////////////////////////////////Emisivitas (e)///////////////////////////////////
// Land Surface Emissivity (ԑ)= Ev*Pv+Es(1-Pv)
////Ref = Sobrino, 2001
var e1_00 = ee.Image(0.985);  // Ev
var e2_00 = (ee.Image(e1_00).multiply(Pv00)); // ev*Pv
var e3_00 = (ee.Image(1).subtract(Pv00)); // (1-Pv)
var e4_00 = (ee.Image(0.978).multiply(e3_00)); // es*(1-Pv), es=0.978
var e00 = (ee.Image(e2_00).add(e4_00));



/////////////////////////////////////ESTIMASI LST///////////////////////////////////////////////
//Menghitung Land Surface Temperature (LST)
var logE00 = e00.log();
var p00 = ee.Image(14388);
// calculate LST = BT/[1+W*(BT/p)*In(e)]
var LST1_00 = ((ee.Image(11.45).multiply(BT00)).divide(p00)); 
var LST2_00 = LST1_05.multiply(logE00); 
var LST3_00 = (ee.Image(1).add(LST2_00)); 
var Final_LST00 = ((BT00).divide(LST3_00)).rename('LST00'); 

var LST_00 = Final_LST00.clip(shp);

Map.addLayer( LST_00, {
  min: 10, max: 50,
  palette: palette},
  'LST 2000');
  
//min, max, mean, stdev LST
{
var minLST_00 = ee.Number(LST_00.reduceRegion({
reducer: ee.Reducer.min(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(minLST_00, 'minLST_2000');

var maxLST_00 = ee.Number(LST_00.reduceRegion({
reducer: ee.Reducer.max(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(maxLST_00, 'maxLST_2000');

var meanLST_00 = ee.Number(LST_00.reduceRegion({
reducer: ee.Reducer.mean(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(meanLST_00, 'meanLST_00');

var stdevLST_00 = ee.Number(LST_00.reduceRegion({
reducer: ee.Reducer.stdDev(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(stdevLST_00, 'stdevLST_00');
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////UHI 2000//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////Daerah UHI dan Non UHI
///Ambang batas UHI (T > μ + 0,5α)

var aUHI_00 = ((ee.Image(0.5).multiply(stdevLST_00))); // μ + 0,5α
var ambangbatasUHI_00 = ((ee.Image(meanLST_00).add(aUHI_00))); //μ + 0,5α
print(ambangbatasUHI_00, 'ambang batas UHI_00')
//ambang batas UHI 2000 = 28.92

//Reclassify UHI Clas
var UHIclass00 = ee.Image(1)
          .where(LST_00.gt(20.68).and(LST_00.lte(28.92)), 1)
          .where(LST_00.gt(28.93).and(LST_00.lte(35.21)), 2);
          
Map.addLayer(UHIclass00.clip(shp), {min: 1, max: 2, palette: ['black', 'red']}, 'UHI 00');
