(this.webpackJsonpcloudinversion=this.webpackJsonpcloudinversion||[]).push([[0],{17:function(e,a,t){e.exports=t(44)},23:function(e,a,t){},44:function(e,a,t){"use strict";t.r(a);var r=t(0),n=t.n(r),c=t(14),l=t.n(c),s=(t(22),t(23),function(e){return n.a.createElement("div",{className:"wrapper"},e.children)}),m=t(4),u=t.n(m),o=t(15),i=t(2),p=t(16),d=t.n(p),h=function(e){return n.a.createElement("div",{className:"content"},e.children)},E=Object(r.createContext)(),_=t(3),b=t.n(_),f=function(){return n.a.createElement("div",{className:"header"},n.a.createElement("h1",{className:"header__title"}," Cloud Inversion Checker "))},w=function(){var e=Object(r.useContext)(E).api_call;return n.a.createElement("div",{className:"weather-search"},n.a.createElement("form",{onSubmit:e,className:"weather-search__form"},n.a.createElement("input",{name:"location",autoComplete:"off",className:"weather-search__input",type:"text"}),n.a.createElement("div",{className:"weather-search__submit"},n.a.createElement("button",{className:"weather-search__button"},"\u2192"))))},v=function(){var e=Object(r.useContext)(E),a=e.weather,t=e.city,c=e.sunrise,l=e.sunset,s=a.temp,m=a.humidity,u=a.pressure;b.a;return n.a.createElement("div",{className:"weather-data"},n.a.createElement("p",{className:"weather__tagline"},"Weather forecast for ",n.a.createElement("span",{className:"weather-data__city"},t)),n.a.createElement("div",{className:"weather-data__box"},n.a.createElement("span",{className:"weather-data__property"},n.a.createElement("p",{className:"weather-data__title"},"Temperature"),n.a.createElement("p",{className:"weather-data__value"},s)),n.a.createElement("span",{className:"weather-data__property"},n.a.createElement("p",{className:"weather-data__title"},"Humidity"),n.a.createElement("p",{className:"weather-data__value"},m)),n.a.createElement("span",{className:"weather-data__property"},n.a.createElement("p",{className:"weather-data__title"},"Pressure"),n.a.createElement("p",{className:"weather-data__value"},u))),n.a.createElement("div",{className:"weather-data__box"},n.a.createElement("span",{className:"weather-data__property"},n.a.createElement("p",{className:"weather-data__title"},"Sunrise"),n.a.createElement("p",{className:"weather-data__value"}," ",n.a.createElement(b.a,{unix:!0,format:"HH:mm"},c))),n.a.createElement("span",{className:"weather-data__property"},n.a.createElement("p",{className:"weather-data__title"},"Sunset"),n.a.createElement("p",{className:"weather-data__value"}," ",n.a.createElement(b.a,{unix:!0,format:"HH:mm"},l)))))},N=function(e){var a=e.error;return n.a.createElement("div",{className:"error"}," ",a," ")},y=function(){var e=new Date;return n.a.createElement("div",{className:"date-time"},"".concat(e.toLocaleDateString()," - ").concat(e.toLocaleTimeString()))},j=function(){return n.a.createElement("div",{className:"tagline"},"Enter the name of the City to get weather information")},O=function(){return n.a.createElement("div",{className:"footer"},"Developed by ",n.a.createElement("a",{rel:"noopener noreferrer",target:"_blank",href:"https://www.soyebpatel.co.uk"},"Soyeb Patel"))},g=function(){var e=Object(r.useState)(),a=Object(i.a)(e,2),t=a[0],c=a[1],l=Object(r.useState)(),s=Object(i.a)(l,2),m=s[0],p=s[1],_=Object(r.useState)(),b=Object(i.a)(_,2),g=b[0],x=b[1],S=Object(r.useState)(),k=Object(i.a)(S,2),C=k[0],H=k[1],D=Object(r.useState)(),P=Object(i.a)(D,2),I=P[0],J=P[1],L=function(){var e=Object(o.a)(u.a.mark((function e(a){var t,r,n,l;return u.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(a.preventDefault(),t=a.target.elements.location.value){e.next=4;break}return e.abrupt("return",(J("Please enter the name of the city"),c(null)));case 4:return"8f3392b07d6c3fbedeb6b9f37746b4bb",r="https://api.openweathermap.org/data/2.5/weather?q=".concat(t,"&appid=").concat("8f3392b07d6c3fbedeb6b9f37746b4bb","&units=metric"),n=d.a.get(r),e.next=9,n;case 9:l=e.sent,console.log(l),c(l.data.main),p(l.data.name),x(l.data.sys.sunrise),H(l.data.sys.sunset),J(null);case 16:case"end":return e.stop()}}),e)})));return function(a){return e.apply(this,arguments)}}(),T={sunrise:g};return console.log(T.sunrise),n.a.createElement("div",{className:"main"},n.a.createElement(f,null),n.a.createElement(h,null,n.a.createElement(y,null),n.a.createElement(j,null),n.a.createElement(E.Provider,{value:{api_call:L,weather:t,city:m,sunrise:g,sunset:C}},n.a.createElement(w,null),t&&n.a.createElement(v,null),I&&n.a.createElement(N,{error:I})),n.a.createElement(O,null)))},x=function(){return n.a.createElement(s,null,n.a.createElement(g,null))};l.a.render(n.a.createElement(x,null),document.getElementById("root"))}},[[17,1,2]]]);
//# sourceMappingURL=main.029e3ef7.chunk.js.map