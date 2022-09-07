class ApiFeatures {
    constructor(query,queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search(){
        //this.queryStr req.query ko access kr raa
        const keyword = this.queryStr.keyword ? {
            name:{
                $regex: this.queryStr.keyword, //regex=regular expression - mongo db ka keyword hai
                $options: "i", //it means case insensitive search krega ABC=abc
            },
        } : {};

        // console.log(keyword);

        this.query = this.query.find({...keyword}); //this.query me product.find() aaya, usi ko improvise kr rhe
                                                    //apne keyword ke liye
        return this; //same class return
    }

    filter(){
        //agar keval this.queryStr likhenge to reference milega to fir queryCopy ke saare changes udhar bhi hounge
        //spread operator use krne se actual copy ban gya
        const queryCopy = {...this.queryStr}

        //Removing some fields for category
        const removeFields = ["keyword","page","limit"];

        removeFields.forEach(key => delete queryCopy[key]);


        //Filter for price and rating
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
        //b ke baad bracket me jo bhi hai vo replace ho jaiga $ + apni key value se gt=$gt

        this.query = this.query.find(JSON.parse(queryStr)); //converting back to object
        return this;
    }  
    
    pagination(resultPerPage){
        
        const currentPage = Number(this.queryStr.page) || 1;

        const skip = resultPerPage * (currentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }
};

module.exports = ApiFeatures;