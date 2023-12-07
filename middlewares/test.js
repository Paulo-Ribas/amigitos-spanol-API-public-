function teste(file) {
    let videoName = file.originalname.split('.')
    if (videoName.length > 2) {
        videoName = videoName.slice(0,videoName.length - 1).join('.')
    }
    else {
        videoName = videoName[0]
    }
     
}

teste({originalname:'doctor-who.eae.melhor.série.mp4'})