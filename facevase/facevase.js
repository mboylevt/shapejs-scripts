function makeShell(profilePath, width, height, voxelSize){
	var radius = width/2;
	var boxDepth = 2*Math.PI*radius;
	var boxWidth = radius;
	var boxHeight = height;
	
	var image = new ImageBitmap(profilePath, boxWidth, boxHeight, boxDepth, voxelSize);
	image.setBaseThickness(0.0);
	image.setUseGrayscale(false);
	image.setBlurWidth(2*voxelSize);
	
	var ct = new CompositeTransform();
	ct.add(new Rotation(0,1,0, -Math.PI/2)); 	
	// align side of the image box with xy lane 
	ct.add(new Translation(0, 0, -radius/2)); 
	ct.add(new RingWrap(radius)); 
	image.setTransform(ct);
	return image;
}

function main(arg){

	var voxelSize = 0.5*MM;
	
	var vaseWidth = 100*MM;
	var vaseHeight = 120*MM;
	var thickness = 4*MM;
	var symmetryOrder = 12;
	var profilePath = arg[0];
	var padding = 2*MM;
	
	var gWidth = vaseWidth*2 + 2*padding;
	var gHeight = vaseHeight*2 + 2*padding;
	
	var shell = makeShell(profilePath, vaseWidth, vaseHeight, voxelSize);
	dest = createGrid(-gWidth/2,gWidth/2,-gHeight/2,gHeight/2,-gWidth/2,gWidth/2,voxelSize);	
	
	print("grid width: " + dest.getWidth());
	print("grid height: " + dest.getHeight());
	
    var maker = new GridMaker(); 
	maker.setSource(shell);
	
	maker.makeGrid(dest);
	
	meshSmoothingWidth = 2;
	meshErrorFactor = 0.05;
	
	return dest;
	
}
