import { db, auth }
from "./firebase.js";

import {
    collection,
    getDocs
}
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// =========================
// ADMIN PROTECTION
// =========================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        location.href = "login.html";

    } else {

        loadStats();

    }

});

// =========================
// LOGOUT
// =========================

document
.getElementById("logoutBtn")
.addEventListener("click", async () => {

    await signOut(auth);

    location.href = "login.html";

});

// =========================
// LOAD STATS
// =========================

async function loadStats() {

    const snapshot =
    await getDocs(
        collection(
            db,
            "merges"
        )
    );

    const merges = [];

    const countryStats = {};
    const browserStats = {};
    const dailyStats = {};

    let totalPdfs = 0;
    let todayMerges = 0;

    snapshot.forEach(doc => {

        const data = doc.data();

        merges.push(data);

        countryStats[data.country] =
        (countryStats[data.country] || 0) + 1;

        browserStats[data.browser] =
        (browserStats[data.browser] || 0) + 1;

        totalPdfs += data.pdfCount;

        const date =
        new Date(data.timestamp);

        const day =
        date.toLocaleDateString();

        dailyStats[day] =
        (dailyStats[day] || 0) + 1;

        const today =
        new Date().toLocaleDateString();

        if (day === today) {

            todayMerges++;

        }

    });

    document.getElementById("totalMerges").innerHTML = merges.length;
    document.getElementById("countryCount").innerHTML = Object.keys(countryStats).length;
    document.getElementById("browserCount").innerHTML = Object.keys(browserStats).length;
    document.getElementById("totalPdfs").innerHTML = totalPdfs;
    document.getElementById("todayMerges").innerHTML = todayMerges;

    let activeDay = "-";
    let max = 0;

    for (const day in dailyStats) {
        if (dailyStats[day] > max) {
            max = dailyStats[day];
            activeDay = day;
        }
    }

    document.getElementById("activeDay").innerHTML = activeDay;

    const table = document.getElementById("activityTable");
    table.innerHTML = "";

    merges.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    merges.forEach(item => {
        table.innerHTML += `
        <tr>
            <td>${item.country}</td>
            <td>${item.browser}</td>
            <td>${item.pdfCount}</td>
            <td>${new Date(item.timestamp).toLocaleString()}</td>
        </tr>
        `;
    });

    const topCountries = document.getElementById("topCountries");

    if(topCountries){
        topCountries.innerHTML = "";
        Object.entries(countryStats)
        .sort((a,b)=>b[1]-a[1])
        .forEach(([country,count])=>{
            topCountries.innerHTML += `
            <tr>
                <td>${country}</td>
                <td>${count}</td>
            </tr>
            `;
        });
    }

    new Chart(document.getElementById("countryChart"), {
        type:"pie",
        data:{
            labels: Object.keys(countryStats),
            datasets:[{ data: Object.values(countryStats) }]
        }
    });

    new Chart(document.getElementById("browserChart"), {
        type:"bar",
        data:{
            labels: Object.keys(browserStats),
            datasets:[{ label:"Users", data: Object.values(browserStats) }]
        }
    });

    const trendCanvas = document.getElementById("trendChart");

    if(trendCanvas){
        new Chart(trendCanvas, {
            type:"line",
            data:{
                labels: Object.keys(dailyStats),
                datasets:[{
                    label:"Daily Merges",
                    data: Object.values(dailyStats),
                    borderWidth:3,
                    fill:false
                }]
            }
        });
    }

    const exportBtn = document.getElementById("exportBtn");

    if(exportBtn){
        exportBtn.addEventListener("click", ()=>{
            let csv = "Country,Browser,PDF Count,Date\n";
            merges.forEach(item=>{
                csv += `${item.country},${item.browser},${item.pdfCount},${item.timestamp}\n`;
            });
            const blob = new Blob([csv], { type:"text/csv" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "analytics.csv";
            a.click();
        });
    }

}
