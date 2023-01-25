import React from "react";
import {
    View,
    Text, StyleSheet
} from "react-native";

export default function PriceFormat(props) {
    const { price, minPrice, maxPrice, style, other } = props;
    const currencyFormat = (price) => {
        var delimiter = ","; // replace comma if desired
        var d = price;
        var i = parseInt(price);
        if (isNaN(i)) { return ''; }
        var minus = '';
        if (i < 0) { minus = '-'; }
        i = Math.abs(i);
        var n = new String(i);
        var a = [];
        while (n.length > 3) {
            var nn = n.substr(n.length - 3);
            a.unshift(nn);
            n = n.substr(0, n.length - 3);
        }
        if (n.length > 0) { a.unshift(n); }
        n = a.join(delimiter);
        if (d.length < 1) { price = n; }
        else { price = n; }
        price = minus + price;
        return other ? '~ ' + price : price;
    }

    const priceRangeView = (min, max) => {
        return min === max ? <Text style={style == undefined ? styles.textStyle : style}>{"$ " + currencyFormat(min)}</Text>
            : <Text style={style == undefined ? styles.textStyle : style}>{"$ " + currencyFormat(min) + " ~ " + currencyFormat(max)}</Text>
    }

    const priceView = (prices) => {
        return <Text style={style == undefined ? styles.textStyle : style}>{"$ " + currencyFormat(prices)}</Text>
    }

    return (
        <View>
            {(price !== '') ? priceView(price) : priceRangeView(minPrice, maxPrice)}
        </View>
    )
}

const styles = StyleSheet.create({
    textStyle: {
        color: "#262c76", fontFamily: "Lexend"
    }
})
