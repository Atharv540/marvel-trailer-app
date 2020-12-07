
var lastUrl, image_present, ready, entry;

const image_input = document.querySelector('#image_input');
const character_input = document.querySelector('#character_input');
const search_input = document.querySelector('#search_input');
const sign_up_email = document.querySelector('#sign_up_email');
const sign_up_password = document.querySelector('#sign_up_password');
const link_input = document.querySelector('#link_input');
lastUrl = '';
image_present = 0;
ready = 0;
entry = 0;

addUser = async () => {
    const email = window.prompt('Email address');
    const password = window.prompt('Password');
    auth.createUserWithEmailAndPassword(email, password)
}

signUserOut = async () => {
    auth.signOut()
}

logUserIn = async () => {
    const email = window.prompt('Email address');
    const password = window.prompt('Password');
    auth.signInWithEmailAndPassword(email, password)

}



auth.onAuthStateChanged(user=>{
    if (user){
        window.alert("You're logged in!")
        
        deleteItem = async (id) => {
            db.collection('trailers').doc(id).delete();
        }
        
        
    }
    else{
        window.alert("You're not signed in!");
    }
    displayImages = async (search_input_value) => {
        ready++
        if(image_present>0){
            for(x=0; x<image_present; x++){
                let element_to_remove = document.getElementById('this_image');
                element_to_remove.remove();
            }
            image_present = 0;
        }
        db.collection('trailers').orderBy('ordered_points', 'desc').get().then(snapshot=>{
            snapshot.docs.forEach(doc=>{
                search_input_value.value = search_input_value.value.toLowerCase();
                if(doc.data().character.toLowerCase().includes(search_input_value.value) || search_input_value.value.includes(doc.data().character.toLowerCase()) || oneSameWord(search_input_value.value, doc.data().character.toLowerCase(), doc)===true){
                    image_present++
                    let img = document.createElement('img');
                    img.setAttribute('src', doc.data().imageUrl);
                    img.setAttribute('id', 'this_image');
                    img.setAttribute('onclick', "doAsDirected('"+doc.id+"','"+doc.data().video_link+"')");
                    img.style.borderRadius = '15px';
                    img.style.marginLeft ='2%';
                    img.style.height = '40%';
                    img.style.marginTop = '50px';
                    document.body.appendChild(img);
                }
            })
        })
    }

    incrementViews = async (id) => {
        let current_views = undefined
        let current_rating = undefined
        await db.collection('trailers').doc(id).get().then(snapshot=>{
            current_views = snapshot.data().views
            console.log(snapshot.data().views)
        })
        db.collection('trailers').doc(id).update({
            views: current_views+1
        })
    }

    changeOrderedPoints = async (id) => {
        let current_rating = undefined;
        let current_views = undefined;
        
        await db.collection('trailers').doc(id).get().then(snapshot=>{
            current_rating = snapshot.data().rating;
            current_views = snapshot.data().views;
        })
        db.collection('trailers').doc(id).update({
            ordered_points: (current_views*current_rating),
        })
    }
    
    oneSameWord = async (search_value, db_value, document) => {
        search_value_split = search_value.split(' ');
        db_value_split = db_value.split(' ');
        // for(x=0; x<search_value_split.length; x++){
        //     for(y=0; y<db_value_split.length; y++){
        //         if((search_value_split[x] === db_value_split[x] || search_value_split[y] === db_value_split[y] || search_value_split[x] === db_value_split[y] || search_value_split[y] === db_value_split[x]) && (search_value_split[x]!=='man' && search_value_split[y]!=='man') && (db_value_split[x]!=='man' && db_value_split[y]!=='man')){
        //             let value = await db.collection('trailers').doc(document.id).get()
        //             image_present++
        //             showImage(value);
        //         }
        //         else if(search_value.includes(db_value_split[y])){
        //             let value = await db.collection('trailers').doc(document.id).get()
        //             console.log('!!!!!!! '+document.id+'/ '+document.data().character+'/ ');
        //             console.log(db_value_split);
        //             console.log(y+'/ '+x);
        //             image_present++
        //             showImage(value);
        //         }
        //     }
        // }
        for(x=0; x<search_value_split.length; x++){
            for(y=0; y<db_value_split.length; y++){
                if(search_value_split[x] === db_value_split[y] && y!==db_value_split.length && db_value_split[y] !== 'man'){
                    let value = await db.collection('trailers').doc(document.id).get()
                    image_present++
                    showImage(value);
                }
                else if(search_value_split[x] !== db_value_split[y] && y!==db_value_split.length){
    
                }
                else if((search_value.includes(db_value_split[y]) || db_value.includes(search_value_split[y])) && db_value_split[y] !== 'man'){
                    let value = await db.collection('trailers').doc(document.id).get()
                    image_present++
                    showImage(value);
                }
                else{
                    
                }
            }
        }
    }

    db.collection('trailers').onSnapshot(snapshot=>{
        let changes = snapshot.docChanges();
        changes.forEach(change=>{
            if(change.type === 'added' && ready>0){
                displayImages(search_input)
            }
            else if(change.type === 'removed' && ready>0){
                displayImages(search_input)
            }
        })
    })

    submitToDatabase = async () => {
        if(user && image_input.value.split('').length>2 && character_input.value.split('').length>2 && link_input.value.split('').length>2){
            db.collection('trailers').add({
                imageUrl: image_input.value,
                character: character_input.value,
                rating: 2,
                raters: 2,
                total_rating_number: 4,
                rated_users: [],
                publisher: user['email'],
                video_link: link_input.value,
                ordered_points: 0,
                views: 0,
            })
            image_input.value = '';
            character_input.value = '';
            link_input.value = '';
        }
        else if(image_input.value.split('').length<2 || character_input.value.split('').length<2 || link_input.value.split('').length>2){
            window.alert('Your link or character needs to be more than 2 characters!');
        }
        else{
            window.alert('You have to sign in, to add images!')
        }
    }
    
    showImage = async (value) => {
        if(lastUrl !== value.data().imageUrl){
            let img = document.createElement('img');
            img.setAttribute('src', value.data().imageUrl);
            img.setAttribute('id', 'this_image');
            img.setAttribute('onclick', "doAsDirected('"+value.id+"','"+value.data().video_link+"')");
            img.style.borderRadius = '15px';
            img.style.marginLeft ='2%';
            img.style.height = '40%';
            img.style.marginTop = '50px';
            document.body.appendChild(img);
        }
        lastUrl = value.data().imageUrl
    }
    
    doAsDirected = async (id, link) => {
        let this_user = undefined
        await db.collection('trailers').doc(id).get().then(snapshot=>{
            this_user = snapshot.data().publisher
        })
        if((user) && user['email'] === this_user){
            let directions = window.prompt('Type delete to delete this video, or "open" to open this link in new tab or "Rate" to rate this video', 'Open').toLowerCase();
            if(directions === 'open'){
                openVideoInNewWindow(link);
                incrementViews(id);
                changeOrderedPoints(id);
            }
            else if(directions === 'rate' && user){
                let current_raters = undefined
                let current_total_rating_number = undefined
                current_rated_users = undefined
                user_rated = undefined
                let rating_input = window.prompt('How much do you rate this image?');
                await db.collection('trailers').doc(id).get().then(documents=>{
                    user_rated = documents.data().rated_users;
                })
                if(rating_input<=5 && user_rated.includes(user['email'])===false){
                    await db.collection('trailers').doc(id).get().then(snapshot=>{
                        current_raters = snapshot.data().raters;
                        current_total_rating_number = snapshot.data().total_rating_number;
                        current_rated_users = snapshot.data().rated_users;
                        current_rated_users.push(user);
                    })
                    db.collection('trailers').doc(id).update({
                        rating: (current_total_rating_number+parseFloat(rating_input))/(current_raters+1),
                        total_rating_number: current_total_rating_number+parseFloat(rating_input),
                        raters: current_raters+1,
                        rated_users: firebase.firestore.FieldValue.arrayUnion(user['email']),
                    })
                }
                else if(user_rated.includes(user['email'])){
                    window.alert('You already rated this video!')
                }
                else{
                    window.alert('This rating '+rating_input+' is too much, only rate numbers below 5!');
                }
            }
        }
        else if(user){
            let directions = window.prompt('Type "open" to open this image in  new tab or "Rate" to rate this image', 'Open').toLowerCase();
            if(directions === 'open'){
                openVideoInNewWindow(link);
            }
            else if(directions === 'rate' && user){
                let current_raters = undefined
                let current_total_rating_number = undefined
                current_rated_users = undefined
                user_rated = undefined
                let rating_input = window.prompt('How much do you rate this image?');
                await db.collection('trailers').doc(id).get().then(documents=>{
                    user_rated = documents.data().rated_users;
                })
                if(rating_input<=5 && user_rated.includes(user['email'])===false){
                    await db.collection('trailers').doc(id).get().then(snapshot=>{
                        current_raters = snapshot.data().raters;
                        current_total_rating_number = snapshot.data().total_rating_number;
                        current_rated_users = snapshot.data().rated_users;
                        current_rated_users.push(user);
                    })
                    db.collection('trailers').doc(id).update({
                        rating: (current_total_rating_number+parseFloat(rating_input))/(current_raters+1),
                        total_rating_number: current_total_rating_number+parseFloat(rating_input),
                        raters: current_raters+1,
                        rated_users: firebase.firestore.FieldValue.arrayUnion(user['email']),
                    })
                }
                else if(user_rated.includes(user['email'])){
                    window.alert('You already rated this image!')
                }
                else{
                    window.alert('This rating '+rating_input+' is too much, only rate numbers below 5!');
                }
            }
        }
        else{
            openVideoInNewWindow(link);
        }
    }
    
    openVideoInNewWindow = async (link) => {
        window.open(link);
    }

})