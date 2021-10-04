define([], function () {

    function* range(start, end) {
        if (start > end)
            for (let i = end; i <= start; i++)
                yield i;
                
        for (let i = start; i <= end; i++)
            yield i;


    }
    function between(start, end, number) {
        return Array.from(range(start, end)).includes(number);
    }


    return {
        range: range,
        between: between
    }


})
