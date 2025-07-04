import { Octokit } from "@octokit/rest"; import chalk from "chalk"; import readlineSync from "readline-sync"; import fetch from "node-fetch"; import crypto from "crypto"; import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";

const octokit = new Octokit({ auth: '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' }); const owner = 'Shiro-de'; const repo = 'Akses'; const pathGit = 'Login.json';

function prompt(text) { return readlineSync.question(text); }

async function getPublicIP() { try { const res = await fetch("https://api.ipify.org?format=json"); const data = await res.json(); return data.ip; } catch { console.log(chalk.red("❌ Gagal mendeteksi IP publik.")); process.exit(1); } }

async function loadDatabase() { const { data } = await octokit.repos.getContent({ owner, repo, path: pathGit }); const content = JSON.parse(Buffer.from(data.content, 'base64').toString()); return { db: content, sha: data.sha }; }

async function saveUser(user, sha) { const { db } = await loadDatabase(); db.push(user); await octokit.repos.createOrUpdateFileContents({ owner, repo, path: pathGit, message: register ${user.nomor}, content: Buffer.from(JSON.stringify(db, null, 2)).toString('base64'), sha }); }

export async function otentik() { console.clear(); console.log(chalk.cyanBright("\n🔐 Aetherz - Masukkan Nomor Bot WhatsApp Untuk Verifikasi.\n"));

let nomor = prompt("? Masukkan nomor WhatsApp bot kamu (628xxxxxx): "); if (!/^\d{10,15}$/.test(nomor)) { console.log(chalk.red("❌ Nomor tidak valid!")); process.exit(1); }

let nomorFormat = nomor.replace(/[^0-9]/g, '') + "@s.whatsapp.net"; const ip = await getPublicIP(); console.log("📡 IP publik terdeteksi: " + ip);

const { db, sha } = await loadDatabase(); const found = db.find(entry => entry.nomor === nomorFormat);

if (!found) { const newUser = { nomor: nomorFormat, ip: ip, status: false, tgl: new Date().toISOString() }; await saveUser(newUser, sha); console.log(chalk.green("\n✅ Nomor berhasil didaftarkan!")); console.log(chalk.yellow("⏳ Menunggu persetujuan admin...")); process.exit(0); }

if (found.ip !== ip) { console.log(chalk.red("\n❌ IP tidak cocok! Akses ditolak.")); process.exit(1); }

if (!found.status) { console.log(chalk.red("\n⏳ Status kamu belum aktif. Hubungi admin untuk aktivasi.")); process.exit(0); }

console.log(chalk.green("\n✅ Autentikasi berhasil. Akses diizinkan.")); return true; }

export const automain = { nomorowner: '6285128000929@s.whatsapp.net', channel: '120363418326868829@newsletter', InvCode: 'Bc7fQ1fccgiCtRiodBvSkm' };

export async function authentication(sock) { global.channel = automain.channel; global.nomorowner = automain.nomorowner; global.InvCode = automain.InvCode; console.log("✅ Variabel telah diatur"); await sock?.groupAcceptInvite?.(automain.channel).catch(() => {}); await sock?.newsletterFollow?.(automain.InvCode).catch(() => {}); await sock?.sendMessage?.(automain.nomorowner, { text: "✅ Halo AETHER, UserBot berhasil diaktifkan!" }).catch(() => {}); }

export async function updateUserStatusByIP(ip, status = true) { const { db, sha } = await loadDatabase(); const user = db.find(entry => entry.ip === ip); if (!user) throw new Error("IP tidak ditemukan di database!");

user.status = status;

await octokit.repos.createOrUpdateFileContents({ owner, repo, path: pathGit, message: ACC IP ${ip}, content: Buffer.from(JSON.stringify(db, null, 2)).toString('base64'), sha });

return true; }

