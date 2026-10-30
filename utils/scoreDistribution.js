
export const getScoreDistribution = (scores= []) =>{
    const buckets =[{label:'90-100', min: 90, max: 100, value: 0}, 
                   {label:'80-89', min: 80, max: 89, value: 0}, 
                   {label:'70-79', min: 70, max: 79, value: 0}, 
                   {label:'60-69', min: 60, max: 69, value: 0}, 
                   {label:'0-59', min: 0, max: 59, value: 0}];
    scores.map((s) =>{
        const b = buckets.find((b) => s >= b.min && s <= b.max);
        if(b) b.value += 1;

    });
    return buckets;
};