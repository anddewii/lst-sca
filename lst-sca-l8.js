///////////////////////////////////Estimation LST and UHI Using Single-Channel Algorithm (SCA) Method and Landsat 8/////////////////////////////////////////


Map.setCenter(106.99, -6.24, 10);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////CLOUD MASK//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// cloudmask Landsat 8
var maskL8 = function(image) {
  var qa = image.select('BQA');
  var mask = qa.bitwiseAnd(1 << 4).eq(0);
  return image.updateMask(mask);
};

// cloudmask for Landsat 8 SR
function maskL8sr(image) {
  // Bits 3 and 5 are cloud shadow and cloud, respectively.
  var cloudShadowBitMask = (1 << 3);
  var cloudsBitMask = (1 << 5);
  // Get the pixel QA band.
  var qa = image.select('pixel_qa');
  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
                 .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////ADD IMAGE//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////Add landsat 8 tahun 2020 (For LST)
var l8data_20 = ee.ImageCollection(l8)
                  .filterBounds(shp)
                  .filterDate('2020-06-01', '2020-10-31')
                  .filterMetadata('CLOUD_COVER', 'less_than', 10)
                  .filterMetadata('CLOUD_COVER_LAND', 'less_than', 10)
                 
print(l8data_20);

var l8d_20 = ee.Image('LANDSAT/LC08/C01/T1_RT/LC08_122064_20200727')
            .clip(shp);
            
//Display all metadata.
print('All metadata:', l8d_20);

var l8_20 = ee.ImageCollection(l8d_20)  
 .filterBounds(shp)
 .map(maskL8)
 .select ("B10");
 
var visualization = {
  min: 0.0,
  max: 30000.0,
  bands: ['B4', 'B3', 'B2'],
};

var visB10 = {
  min: 0.0,
  max: 30000.0,
  bands: ['B10'],
};


//////////////////////Add landsat 8 tahun 2015 (For LST)
var l8data_15 = ee.ImageCollection(l8)
                  .filterBounds(shp)
                  .filterDate('2015-06-01', '2015-10-31')
                  .filterMetadata('CLOUD_COVER', 'less_than', 10)
                  .filterMetadata('CLOUD_COVER_LAND', 'less_than', 10)
                 
print(l8data_15, '2015');

var l8d_15 = ee.Image('LANDSAT/LC08/C01/T1_RT/LC08_122064_20150831')
            .clip(shp);
var l8_15 = ee.ImageCollection(l8d_15)  
 .filterBounds(shp)
 .map(maskL8)
 .select ("B10");
 
//Map.addLayer(l8_15, visB10, 'landsat_2015');

//////////////////////Add landsat 8 Surface Reflectance tahun 2020 (For NDVI)
var l8data_20sr = ee.ImageCollection(L8SR1)
                  .filterBounds(shp)
                  .filterDate('2020-06-01', '2020-10-31')
                  .filterMetadata('CLOUD_COVER', 'less_than', 10)
                  .filterMetadata('CLOUD_COVER_LAND', 'less_than', 10)
                 
print(l8data_20sr);

var l8d_20sr = ee.Image('LANDSAT/LC08/C01/T1_SR/LC08_122064_20200727')
            .clip(shp);
var l8_20sr = ee.ImageCollection(l8d_20sr)   
.map(maskL8sr)
.mean()
.clip(shp);

//Map.addLayer(l8_20sr, visualization, 'landsat_2020');

//////////////////////Add landsat 8 Surface Reflectance tahun 2015 (For NDVI)
var l8data_15sr = ee.ImageCollection(L8SR1)
                  .filterBounds(shp)
                  .filterDate('2015-06-01', '2015-10-31')
                  .filterMetadata('CLOUD_COVER', 'less_than', 10)
                  .filterMetadata('CLOUD_COVER_LAND', 'less_than', 10)
                 
print(l8data_15sr, '2015 SR');

var l8d_15sr = ee.Image('LANDSAT/LC08/C01/T1_SR/LC08_122064_20150831')
            .clip(shp);
var l8_15sr = ee.ImageCollection(l8d_15sr)   
.map(maskL8sr)
.mean()
.clip(shp);

//Map.addLayer(l8_15sr, visualization, 'landsat_2015sr');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////SET PALLATE//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var palette = ['2900FF','001DFF','005DFF','009DFF','00E5FF','00FFD4',
'00FFCB','00FF86','00FF3F','04FF00','5AFF00','B7FF00',
'DBFF00','FFEF00','FFD600','FFBA00','FF9C00','FF7C00',
'#FF6E00','#FF4800','#FF2200','#FF0000','7D0000','230000']

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////LST 2020//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////Convert DN To RADIANCE and BT///////////////////////////////////
//Formula DN TO RADIANCE  = (B10*0.0003342)+0.1)
var BTCelcius = l8_20.map(function(img){
  var id= img.id();
  return img.expression ('((1321.08/(log(774.89/((B10*0.0003342)+0.1)+1)))-272.15)' //(B10*0.0003342)+0.1)= DN TO Toa Radian
,{'B10':img})
  .rename('B10_20')
  .copyProperties (img, ['system:time_start'])
});
print(BTCelcius, 'bt');
var BT = BTCelcius.mean().clip(shp);


/////////////////////////////////////////NDVI/////////////////////////////////////////
var ndvi = l8_20sr.normalizedDifference(['B5', 'B4']).rename('NDVI20');

//min max 
var min = ee.Number(ndvi.reduceRegion({
reducer: ee.Reducer.min(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(min, 'min_2020');

var max = ee.Number(ndvi.reduceRegion({
reducer: ee.Reducer.max(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(max, 'max_2020')



//////////////////////////////////////////Pv//////////////////////////////////////////
var Pv_olah =((ndvi).subtract(min))
                .divide(max.subtract(min));
var Pv = Pv_olah.pow(ee.Number(2));              

/////////////////////////////////////Emisivitas (e)///////////////////////////////////
// Land Surface Emissivity (ԑ)= Ev*Pv+Es(1-Pv)
////Referensi formula emsivitas = Sobrino, 2001
var e1 = ee.Image(0.985);  // Ev
var e2 = (ee.Image(e1).multiply(Pv)); // ev*Pv
var e3 = (ee.Image(1).subtract(Pv)); // (1-Pv)
var e4 = (ee.Image(0.978).multiply(e3)); // es*(1-Pv), es=0.978
var e = (ee.Image(e2).add(e4));      


/////////////////////////////////////ESTIMASI LST///////////////////////////////////////////////
var logE = e.log();
var p = ee.Image(14388);
// calculate LST = BT/[1+(ʎ*BT/p)*In(e)]
var LST1 = ((ee.Image(10.8).multiply(BT)).divide(p)); // (ʎ*BT/p) //ʎ B10= 10.8
var LST2 = LST1.multiply(logE); // (ʎ*BT/p)*In(e)
var LST3 = (ee.Image(1).add(LST2)); //1+(ʎ*BT/p)*In(e)
var Final_LST = ((BT).divide(LST3)).rename('LST20'); // BT/[1+(ʎ*BT/p)*In(e)]
print(Final_LST, 'LST20')


Map.addLayer(Final_LST , {
  min: 0, max: 50,
  palette: palette},
  'LST 2020');

//min, max, mean, stdev LST
{
var minLST_20 = ee.Number(Final_LST.reduceRegion({
reducer: ee.Reducer.min(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(minLST_20, 'minLST_2020');

var maxLST_20 = ee.Number(Final_LST.reduceRegion({
reducer: ee.Reducer.max(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(maxLST_20, 'maxLST_2020');

var meanLST_20 = ee.Number(Final_LST.reduceRegion({
reducer: ee.Reducer.mean(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(meanLST_20, 'meanLST_20');

var stdevLST_20 = ee.Number(Final_LST.reduceRegion({
reducer: ee.Reducer.stdDev(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(stdevLST_20, 'stdevLST_20');
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////UHI 2020//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////Daerah UHI dan Non UHI
///Ambang batas UHI (T > μ + 0,5α)

var aUHI_20 = ((ee.Image(0.5).multiply(stdevLST_20))); // μ + 0,5α
var ambangbatasUHI_20 = ((ee.Image(meanLST_20).add(aUHI_20))); //μ + 0,5α
print(ambangbatasUHI_20, 'ambang batas UHI_20')

var UHIclass = ee.Image(1)
          .where(Final_LST.gt(25.17).and(Final_LST.lte(31.14)), 1)
          .where(Final_LST.gt(31.15).and(Final_LST.lte(38.63)), 2);
          
Map.addLayer(UHIclass.clip(shp), {min: 1, max: 2, palette: ['black', 'red']}, 'UHI 20');


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////LST 2015//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////Convert DN To RADIANCE and BT///////////////////////////////////
var BTCelcius15 = l8_15.map(function(img){
  var id= img.id();
  return img.expression ('((1321.08/(log(774.89/((B10*0.0003342)+0.1)+1)))-272.15)'
,{'B10':img})
  .rename('B10_15')
  .copyProperties (img, ['system:time_start'])
});
var BT15 = BTCelcius15.mean().clip(shp);

/////////////////////////////////////////NDVI/////////////////////////////////////////
var ndvi15 = l8_15sr.normalizedDifference(['B5', 'B4']).rename('NDVI15');

//min max 
var min15 = ee.Number(ndvi15.reduceRegion({
reducer: ee.Reducer.min(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(min15, 'min_2015');

var max15 = ee.Number(ndvi15.reduceRegion({
reducer: ee.Reducer.max(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(max15, 'max_2015')

//////////////////////////////////////////Pv//////////////////////////////////////////
var Pv_olah15 =((ndvi15).subtract(min15))
                .divide(max15.subtract(min15));
var Pv15 = Pv_olah15.pow(ee.Number(2));              


/////////////////////////////////////Emisivitas (e)///////////////////////////////////
// Land Surface Emissivity (ԑ)= Ev*Pv+Es(1-Pv)
var e1_15 = ee.Image(0.985);  // Ev
var e2_15 = (ee.Image(e1_15).multiply(Pv15)); // ev*Pv
var e3_15 = (ee.Image(1).subtract(Pv15)); // (1-Pv)
var e4_15 = (ee.Image(0.978).multiply(e3_15)); // es*(1-Pv), es=0.978
var e_15 = (ee.Image(e2_15).add(e4_15));                


/////////////////////////////////////ESTIMASI LST///////////////////////////////////////////////

var logE15 = e_15.log();
var p = ee.Image(14388);
// calculate LST = BT/[1+W*(BT/p)*In(e)]
var LST1_15 = ((ee.Image(10.8).multiply(BT15)).divide(p)); // (ʎ*BT/p) //ʎ B6= 10.8
var LST2_15 = LST1.multiply(logE15); // (ʎ*BT/p)*In(e)
var LST3_15 = (ee.Image(1).add(LST2_15)); //1+(ʎ*BT/p)*In(e)
var Final_LST_15 = ((BT15).divide(LST3_15)).rename('LST15'); // BT/[1+(ʎ*BT/p)*In(e)]

Map.addLayer(Final_LST_15 , {
  min: 0, max: 50,
  palette: palette},
  'LST  2015');
print(Final_LST_15, 'LST');


//min, max, mean, stdev LST
{
var minLST_15 = ee.Number(Final_LST_15.reduceRegion({
reducer: ee.Reducer.min(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(minLST_15, 'minLST_2015');

var maxLST_15 = ee.Number(Final_LST_15.reduceRegion({
reducer: ee.Reducer.max(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(maxLST_15, 'maxLST_2015');

var meanLST_15 = ee.Number(Final_LST_15.reduceRegion({
reducer: ee.Reducer.mean(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(meanLST_15, 'meanLST_15');

var stdevLST_15 = ee.Number(Final_LST_15.reduceRegion({
reducer: ee.Reducer.stdDev(),
geometry: shp,
scale: 30,
maxPixels: 1e9
}).values().get(0));
print(stdevLST_15, 'stdevLST_15');
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////UHI 2015//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////Daerah UHI dan Non UHI
///Ambang batas UHI (T > μ + 0,5α)

var aUHI_15 = ((ee.Image(0.5).multiply(stdevLST_15))); // μ + 0,5α
var ambangbatasUHI_15 = ((ee.Image(meanLST_15).add(aUHI_15))); //μ + 0,5α
print(ambangbatasUHI_15, 'ambang batas UHI_15')

//ambang batas UHI 2015 = 36,19
var UHIclass15 = ee.Image(1)
          .where(Final_LST_15.gt(26.51).and(Final_LST_15.lte(36.18)), 1)
          .where(Final_LST_15.gt(36.19).and(Final_LST_15.lte(42.41)), 2);
          
Map.addLayer(UHIclass15.clip(shp), {min: 1, max: 2, palette: ['black', 'red']}, 'UHI 15');



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////LEGENDA//////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Set up general display
//Set up a satellite background
Map.setOptions('Satellite')

//Change style of cursor to 'crosshair'
Map.style().set('cursor', 'crosshair');

//Set up a Viridis color pallete to display the data
var viridis = {min: 0 , max : 50,palette: palette};
var ndviVis = {min:0, max:50, palette: palette}

//Function legend
function createColorBar(titleText, palette, min, max) {
  // Legend Title
  var title = ui.Label({
    value: titleText, 
    style: {fontWeight: 'bold', textAlign: 'center', stretch: 'horizontal'}});

  // Colorbar
  var legend = ui.Thumbnail({
    image: ee.Image.pixelLonLat().select(0),
    params: {
      bbox: [0, 0, 1, 0.1],
      dimensions: '200x20',
      format: 'png', 
      min: 0, max: 1,
      palette: palette},
    style: {stretch: 'horizontal', margin: '8px 8px', maxHeight: '40px'},
  });
  
  // Legend Labels
  var labels = ui.Panel({
    widgets: [
      ui.Label(min, {margin: '4px 10px',textAlign: 'left', stretch: 'horizontal'}),
      ui.Label((min+max)-40, {margin: '4px 20px', textAlign: 'center', stretch: 'horizontal'}),
      ui.Label((min+max)-30, {margin: '4px 20px', textAlign: 'center', stretch: 'horizontal'}),
      ui.Label((min+max)-20, {margin: '4px 20px', textAlign: 'center', stretch: 'horizontal'}),
      ui.Label((min+max)-10, {margin: '4px 20px', textAlign: 'center', stretch: 'horizontal'}),
      ui.Label(max, {margin: '4px 10px',textAlign: 'right', stretch: 'horizontal'})],
    layout: ui.Panel.Layout.flow('horizontal')});
  
  // Create a panel with all 3 widgets
  var legendPanel = ui.Panel({
    widgets: [title, legend, labels],
    style: {position: 'bottom-left', padding: '8px 15px'}
  })
  return legendPanel
}
// Call the function to create a colorbar legend  
var colorBar = createColorBar('LST Values', palette, 0, 50)

Map.add(colorBar)
