import { useState, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM
═══════════════════════════════════════════════════════════════ */
const S = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --ocean:#0D2B45; --deep:#071825; --tide:#143352;
  --terra:#C4603A; --terra-lt:#D97A56;
  --gold:#C9A84C;  --gold-lt:#E2C06A;
  --foam:#EEF4F8;  --mist:#D6E4EE;
  --ink:#0A1F30;   --slate:#5B7A8E;
  --surface:#F4F8FB; --white:#fff;
  --green:#2E7D4F; --amber:#9D4E1F; --red:#C04040;
}
body{font-family:'DM Sans',sans-serif;background:var(--surface);color:var(--ink)}
button{font-family:'DM Sans',sans-serif;cursor:pointer}
input,select,textarea{font-family:'DM Sans',sans-serif}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:var(--foam)}
::-webkit-scrollbar-thumb{background:var(--mist);border-radius:10px}

.nav{display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:62px;background:var(--deep);position:sticky;top:0;z-index:300;border-bottom:1px solid rgba(201,168,76,0.15)}
.nav-logo{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:900;color:var(--foam);letter-spacing:-0.5px;display:flex;align-items:center;gap:0}
.nav-logo span{color:var(--terra);font-style:italic}
.nav-links{display:flex;gap:4px}
.nav-link{padding:8px 18px;border-radius:100px;font-size:13px;font-weight:500;color:rgba(255,255,255,0.6);background:none;border:none;cursor:pointer;transition:all 0.15s}
.nav-link:hover{color:#fff;background:rgba(255,255,255,0.07)}
.nav-link.active{color:#fff;background:rgba(255,255,255,0.1)}
.nav-cta{background:var(--terra);color:#fff;padding:9px 22px;border-radius:100px;font-size:13px;font-weight:600;border:none;cursor:pointer;transition:all 0.2s}
.nav-cta:hover{background:var(--terra-lt);transform:translateY(-1px);box-shadow:0 6px 20px rgba(196,96,58,0.35)}

.hero{background:var(--deep);padding:88px 64px 100px;display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center;position:relative;overflow:hidden}
.hero-grain{position:absolute;inset:0;opacity:0.5;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")}
.hero-glow{position:absolute;top:-100px;right:-60px;width:560px;height:560px;background:radial-gradient(circle,rgba(196,96,58,0.13) 0%,transparent 65%);pointer-events:none}
.hero-glow2{position:absolute;bottom:-60px;left:180px;width:380px;height:380px;background:radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 65%);pointer-events:none}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(201,168,76,0.12);border:1px solid rgba(201,168,76,0.25);border-radius:100px;padding:5px 14px;font-family:'DM Mono',monospace;font-size:10px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:24px}
.hero-h1{font-family:'Cormorant Garamond',serif;font-size:64px;font-weight:700;line-height:1.03;color:#fff;margin-bottom:22px}
.hero-h1 em{color:var(--terra);font-style:italic}
.hero-h1 span{color:var(--gold-lt)}
.hero-p{font-size:16px;color:rgba(255,255,255,0.55);line-height:1.75;max-width:420px;margin-bottom:40px}
.hero-btns{display:flex;gap:14px;align-items:center}
.btn-hero{background:var(--terra);color:#fff;padding:15px 32px;border-radius:100px;font-size:15px;font-weight:600;border:none;cursor:pointer;transition:all 0.2s}
.btn-hero:hover{background:var(--terra-lt);transform:translateY(-2px);box-shadow:0 10px 28px rgba(196,96,58,0.4)}
.btn-ghost{color:rgba(255,255,255,0.6);font-size:14px;background:none;border:1px solid rgba(255,255,255,0.15);padding:14px 26px;border-radius:100px;cursor:pointer;transition:all 0.2s}
.btn-ghost:hover{border-color:rgba(255,255,255,0.35);color:#fff}
.hero-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(12px);border-radius:24px;padding:28px;box-shadow:0 40px 80px rgba(0,0,0,0.4);position:relative}
.hero-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent)}
.hero-card-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(196,96,58,0.2);border:1px solid rgba(196,96,58,0.4);border-radius:100px;padding:4px 12px;font-size:10px;font-weight:600;color:var(--terra-lt);letter-spacing:0.5px;text-transform:uppercase;margin-bottom:14px}
.hero-card-title{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700;color:#fff;margin-bottom:3px}
.hero-card-meta{font-family:'DM Mono',monospace;font-size:10px;color:var(--slate);letter-spacing:0.5px;margin-bottom:18px;text-transform:uppercase}
.hday{display:flex;gap:12px;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);margin-bottom:8px;align-items:flex-start}
.hday-num{font-family:'DM Mono',monospace;font-size:10px;color:var(--terra-lt);font-weight:500;min-width:34px;margin-top:1px}
.hday-title{font-size:12px;font-weight:500;color:rgba(255,255,255,0.85);margin-bottom:5px}
.hpill{background:rgba(255,255,255,0.07);border-radius:100px;padding:2px 9px;font-size:10px;color:rgba(255,255,255,0.45)}
.hpill.done{background:rgba(201,168,76,0.15);color:var(--gold-lt)}

.stats-bar{background:var(--ocean);padding:22px 64px;display:flex;gap:56px;border-bottom:1px solid rgba(255,255,255,0.06)}
.stat-num{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:700;color:var(--gold)}
.stat-label{font-size:11px;color:var(--slate);margin-top:2px}

.shell{display:grid;grid-template-columns:272px 1fr;min-height:calc(100vh - 62px)}
.sidebar{background:var(--deep);padding:28px 18px;display:flex;flex-direction:column;gap:4px;border-right:1px solid rgba(255,255,255,0.06)}
.sb-section{font-family:'DM Mono',monospace;font-size:9px;color:var(--slate);letter-spacing:2px;text-transform:uppercase;padding:18px 10px 8px}
.sb-item{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:10px;cursor:pointer;transition:all 0.15s;color:rgba(255,255,255,0.5);font-size:13px;border:none;background:none;width:100%;text-align:left}
.sb-item:hover{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.85)}
.sb-item.active{background:rgba(196,96,58,0.15);color:var(--terra-lt);border:1px solid rgba(196,96,58,0.2)}
.sb-icon{font-size:15px;width:20px;text-align:center;flex-shrink:0}
.content{padding:40px 48px;overflow-y:auto;background:var(--surface)}

.pg-eyebrow{font-family:'DM Mono',monospace;font-size:10px;color:var(--slate);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px}
.pg-title{font-family:'Cormorant Garamond',serif;font-size:38px;font-weight:700;color:var(--ink);margin-bottom:6px;line-height:1.1}

.vibe-grid{display:flex;flex-wrap:wrap;gap:8px}
.vibe-chip{display:flex;align-items:center;gap:7px;padding:9px 16px;border-radius:100px;border:1.5px solid var(--mist);background:#fff;font-size:13px;color:var(--ink);cursor:pointer;transition:all 0.15s;font-weight:400}
.vibe-chip:hover{border-color:var(--terra);color:var(--terra)}
.vibe-chip.on{background:var(--ocean);color:#fff;border-color:var(--ocean)}
.chip-dot{width:6px;height:6px;border-radius:50%;background:var(--mist);flex-shrink:0;transition:background 0.15s}
.vibe-chip.on .chip-dot{background:var(--gold)}

.days-col{display:flex;flex-direction:column;gap:14px;margin-bottom:28px}
.iday{background:#fff;border-radius:16px;border:1.5px solid var(--mist);overflow:hidden;transition:border-color 0.2s}
.iday:hover{border-color:var(--terra)}
.iday-hd{display:flex;align-items:center;justify-content:space-between;padding:15px 20px;background:var(--foam);cursor:pointer}
.iday-badge{background:var(--ocean);color:#fff;font-family:'DM Mono',monospace;font-size:10px;padding:4px 11px;border-radius:100px;letter-spacing:1px}
.iday-name{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:700;color:var(--ink)}
.iday-sub{font-size:11px;color:var(--slate);margin-top:1px}
.iday-body{padding:18px;display:flex;flex-direction:column;gap:10px}

.photo-strip{display:flex;gap:8px;margin-bottom:4px;flex-wrap:wrap}
.photo-thumb{width:72px;height:56px;border-radius:10px;border:2px solid var(--mist);display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;transition:all 0.15s;background:var(--foam)}
.photo-thumb:hover{border-color:var(--terra);transform:scale(1.04)}
.photo-add{width:72px;height:56px;border-radius:10px;border:1.5px dashed var(--mist);background:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;transition:all 0.15s;color:var(--slate);font-size:10px}
.photo-add:hover{border-color:var(--terra);color:var(--terra)}

.block{display:flex;align-items:flex-start;gap:13px;padding:13px 15px;border-radius:12px;border:1.5px solid var(--mist);background:var(--surface);transition:all 0.15s}
.block:hover{border-color:rgba(196,96,58,0.3);background:#FBF8F6}
.block-ico{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.block-body{flex:1}
.block-title{font-size:14px;font-weight:500;color:var(--ink);margin-bottom:2px}
.block-detail{font-size:11px;color:var(--slate);line-height:1.5}
.block-cancel{font-size:10px;color:var(--amber);font-family:'DM Mono',monospace;margin-top:3px;display:flex;align-items:center;gap:4px}
.block-cancel.safe{color:var(--green)}
.block-right{display:flex;flex-direction:column;align-items:flex-end;gap:5px}
.block-price{font-family:'DM Mono',monospace;font-size:13px;color:var(--ink);font-weight:500}
.pill-booked{background:#E3F0E8;color:var(--green);font-size:10px;padding:3px 9px;border-radius:100px;font-weight:500}
.pill-pending{background:#FEF0E6;color:var(--amber);font-size:10px;padding:3px 9px;border-radius:100px;font-weight:500}
.book-link{font-size:11px;color:var(--terra);background:none;border:none;cursor:pointer;font-weight:500;text-decoration:underline;padding:0}
.add-row{display:flex;align-items:center;gap:8px;padding:11px 15px;border-radius:12px;border:1.5px dashed var(--mist);background:none;color:var(--slate);font-size:13px;cursor:pointer;width:100%;transition:all 0.15s}
.add-row:hover{border-color:var(--terra);color:var(--terra);background:#FEF8F5}

.intel-panel{background:var(--ocean);border-radius:16px;padding:22px;margin-bottom:18px;position:relative;overflow:hidden}
.intel-panel::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent)}
.intel-title{font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:700;color:#fff;margin-bottom:3px}
.intel-sub{font-size:11px;color:var(--slate);margin-bottom:16px}
.intel-row{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);align-items:flex-start}
.intel-row:last-child{border-bottom:none}
.intel-dot{width:7px;height:7px;border-radius:50%;margin-top:5px;flex-shrink:0}
.intel-text{font-size:12px;color:rgba(255,255,255,0.75);line-height:1.65}
.intel-src{font-family:'DM Mono',monospace;font-size:9px;color:var(--slate);margin-top:3px}

.ck-panel{background:#fff;border-radius:16px;border:1.5px solid var(--mist);padding:22px;margin-bottom:18px}
.ck-title{font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:700;color:var(--ink);margin-bottom:3px}
.ck-sub{font-size:11px;color:var(--slate);margin-bottom:16px}
.ck-row{display:flex;align-items:center;gap:11px;padding:9px 0;border-bottom:1px solid var(--mist)}
.ck-row:last-child{border-bottom:none}
.ck-box{width:18px;height:18px;border-radius:5px;border:2px solid var(--mist);cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.15s;font-size:10px;color:#fff}
.ck-box.done{background:var(--ocean);border-color:var(--ocean)}
.ck-label{font-size:13px;color:var(--ink);flex:1}
.ck-label.done{text-decoration:line-through;color:var(--slate)}
.ck-dead{font-family:'DM Mono',monospace;font-size:10px;color:var(--terra)}

.budget-panel{background:#fff;border-radius:16px;border:1.5px solid var(--mist);padding:22px}
.bbar{height:6px;background:var(--mist);border-radius:10px;overflow:hidden;margin-top:4px}
.bbar-fill{height:100%;border-radius:10px}

.discover-tabs{display:flex;gap:6px;margin-bottom:28px;border-bottom:1px solid var(--mist)}
.dtab{padding:10px 20px;font-size:13px;font-weight:500;cursor:pointer;border:none;background:none;color:var(--slate);border-bottom:2px solid transparent;transition:all 0.15s;margin-bottom:-1px}
.dtab.active{color:var(--terra);border-bottom-color:var(--terra)}
.fchip{padding:7px 16px;border-radius:100px;border:1.5px solid var(--mist);background:#fff;font-size:12px;color:var(--ink);cursor:pointer;transition:all 0.15s}
.fchip.active{background:var(--ocean);color:#fff;border-color:var(--ocean)}
.fchip:hover:not(.active){border-color:var(--terra);color:var(--terra)}

.card-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.ccard{background:#fff;border-radius:18px;border:1.5px solid var(--mist);overflow:hidden;cursor:pointer;transition:all 0.22s}
.ccard:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(13,43,69,0.12);border-color:var(--terra)}
.ccard-img{height:140px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:52px}
.ccard-img-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(13,43,69,0.75))}
.ccard-img-meta{position:absolute;bottom:10px;left:12px;right:12px;display:flex;align-items:flex-end;justify-content:space-between}
.ccard-dest{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:700;color:#fff;line-height:1.1}
.ccard-votes{display:flex;align-items:center;gap:4px;background:rgba(201,168,76,0.25);border:1px solid rgba(201,168,76,0.4);border-radius:100px;padding:3px 10px;font-size:11px;color:var(--gold-lt);font-weight:600}
.ccard-body{padding:14px 16px}
.ccard-author{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.ccard-avatar{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:#fff;flex-shrink:0}
.ccard-name{font-size:12px;color:var(--slate)}
.ccard-meta{font-size:11px;color:var(--slate);margin-bottom:8px}
.ctag{background:var(--foam);border-radius:100px;padding:3px 10px;font-size:10px;color:var(--slate);text-transform:uppercase;letter-spacing:0.4px}
.ctag.hi{background:rgba(196,96,58,0.1);color:var(--terra)}

.ffeed-card{background:#fff;border-radius:18px;border:1.5px solid var(--mist);overflow:hidden;margin-bottom:18px}
.ffeed-header{display:flex;align-items:center;gap:12px;padding:16px 18px 12px}
.ffeed-avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#fff;flex-shrink:0}
.ffeed-user{font-size:14px;font-weight:500;color:var(--ink)}
.ffeed-action{font-size:12px;color:var(--slate)}
.ffeed-footer{display:flex;align-items:center;gap:16px;padding:12px 18px;border-top:1px solid var(--mist)}
.ffeed-btn{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--slate);background:none;border:none;cursor:pointer;transition:color 0.15s}
.ffeed-btn:hover{color:var(--terra)}

.profile-map-header{position:relative;border-radius:20px;overflow:hidden;height:230px;margin-bottom:24px;background:var(--deep)}
.profile-overlay{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(7,24,37,0.97));padding:48px 32px 28px;display:flex;align-items:flex-end;justify-content:space-between}
.profile-avatar{width:70px;height:70px;border-radius:50%;background:var(--terra);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:700;color:#fff;border:3px solid rgba(201,168,76,0.5);flex-shrink:0}
.profile-name{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:#fff;margin-bottom:3px}
.pstats{display:flex;gap:28px;margin-top:10px}
.pstat-n{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700;color:var(--gold)}
.pstat-l{font-size:10px;color:var(--slate);margin-top:1px}
.hist-row{background:#fff;border-radius:14px;border:1.5px solid var(--mist);padding:15px 20px;display:flex;align-items:center;gap:15px;cursor:pointer;transition:border-color 0.15s;margin-bottom:10px}
.hist-row:hover{border-color:var(--terra)}
.hist-dest{font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:700;color:var(--ink);margin-bottom:2px}
.hist-meta{font-size:11px;color:var(--slate)}
.hist-rank{font-family:'DM Mono',monospace;font-size:11px;color:var(--terra);font-weight:500;white-space:nowrap}

.overlay{position:fixed;inset:0;z-index:1000;background:rgba(7,24,37,0.82);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:24px}
.modal{background:var(--surface);border-radius:24px;width:100%;max-width:860px;max-height:92vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 48px 96px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.08)}
.modal-hd{padding:22px 28px 16px;border-bottom:1px solid var(--mist);display:flex;align-items:flex-start;justify-content:space-between;flex-shrink:0}
.modal-title{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:700;color:var(--ink)}
.modal-sub{font-size:12px;color:var(--slate);margin-top:3px;font-family:'DM Mono',monospace}
.modal-body{overflow-y:auto;padding:20px 28px;flex:1}
.x-btn{width:32px;height:32px;border-radius:50%;border:1.5px solid var(--mist);background:none;font-size:15px;color:var(--slate);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.x-btn:hover{background:var(--mist)}

.type-box{background:#fff;border-radius:22px;padding:30px;width:360px;box-shadow:0 40px 80px rgba(0,0,0,0.5)}
.tpick-btn{display:flex;align-items:center;gap:14px;padding:13px 16px;border-radius:14px;border:1.5px solid var(--mist);background:none;text-align:left;cursor:pointer;width:100%;margin-bottom:8px;transition:all 0.15s}
.tpick-btn:hover{border-color:var(--terra);background:#FEF8F5}
.tpick-ico{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0}
.tpick-lbl{font-size:14px;font-weight:500;color:var(--ink)}

.compare-table{width:100%;border-collapse:collapse;font-size:13px}
.compare-table th{background:var(--ocean);color:rgba(255,255,255,0.8);padding:10px 14px;text-align:left;font-size:10px;font-weight:500;font-family:'DM Mono',monospace;letter-spacing:1px}
.compare-table th:first-child{border-radius:10px 0 0 10px}
.compare-table th:last-child{border-radius:0 10px 10px 0}
.compare-table td{padding:12px 14px;border-bottom:1px solid var(--mist);vertical-align:middle}
.compare-table tr:last-child td{border-bottom:none}
.compare-table tr:hover td{background:var(--foam)}
.best-v{color:var(--green);font-weight:600}
.sel-btn{padding:7px 16px;border-radius:100px;border:1.5px solid var(--mist);font-size:12px;cursor:pointer;transition:all 0.15s;white-space:nowrap}
.sel-btn.on{background:var(--terra);color:#fff;border-color:var(--terra)}

.setup-card{background:#fff;border-radius:20px;border:1.5px solid var(--mist);padding:36px;max-width:600px}
.form-label{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--slate);display:block;margin-bottom:7px}
.form-inp{width:100%;padding:12px 16px;border-radius:12px;border:1.5px solid var(--mist);background:var(--foam);font-size:14px;color:var(--ink);outline:none;transition:border-color 0.15s}
.form-inp:focus{border-color:var(--terra)}
.form-grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:20px}

/* reflect */
.reflect-banner{background:linear-gradient(135deg,var(--ocean),var(--tide));border-radius:16px;padding:20px 24px;margin-bottom:24px;display:flex;align-items:center;gap:16px;border:1px solid rgba(201,168,76,0.2)}
.reflect-cta{background:rgba(201,168,76,0.2);border:1px solid rgba(201,168,76,0.4);color:var(--gold-lt);padding:9px 20px;border-radius:100px;font-size:12px;font-weight:600;cursor:pointer;flex-shrink:0;transition:all 0.15s;margin-left:auto}
.reflect-cta:hover{background:rgba(201,168,76,0.32)}

/* slider */
.slider-wrap{position:relative;margin:10px 0 6px}
.slider-track{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:10px;outline:none;cursor:pointer;background:linear-gradient(to right,var(--terra) 0%,var(--gold) 50%,var(--ocean) 100%)}
.slider-track::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:var(--ocean);border:3px solid var(--gold);cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2)}
.slider-labels{display:flex;justify-content:space-between;font-size:10px;color:var(--slate);margin-top:6px;font-family:'DM Mono',monospace}

/* about page */
.about-hero{background:linear-gradient(135deg,var(--deep),var(--ocean));border-radius:20px;padding:56px 48px;margin-bottom:32px;position:relative;overflow:hidden}
.about-hero::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent)}
.about-section{background:#fff;border-radius:16px;border:1.5px solid var(--mist);padding:32px;margin-bottom:20px}
.about-section h2{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:var(--ink);margin-bottom:12px}
.about-section p{font-size:15px;color:var(--slate);line-height:1.75;margin-bottom:12px}
.about-section p:last-child{margin-bottom:0}
.about-pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px}
.pillar{background:var(--foam);border-radius:14px;padding:22px;border:1px solid var(--mist);text-align:center}
.pillar-icon{font-size:28px;margin-bottom:10px}
.pillar-title{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:700;color:var(--ink);margin-bottom:6px}
.pillar-desc{font-size:12px;color:var(--slate);line-height:1.6}
.phase-row{display:flex;gap:16px;margin-bottom:12px;align-items:flex-start}
.phase-badge{background:var(--ocean);color:#fff;font-family:'DM Mono',monospace;font-size:10px;padding:4px 12px;border-radius:100px;letter-spacing:1px;white-space:nowrap;margin-top:3px;flex-shrink:0}
.phase-text{font-size:14px;color:var(--slate);line-height:1.6}
.phase-title{font-size:14px;font-weight:600;color:var(--ink);margin-bottom:2px}

/* map interactive */
.map-outer{position:relative;background:var(--ocean);border-radius:20px;overflow:hidden;margin-bottom:0;user-select:none}
.map-hint{position:absolute;bottom:12px;right:16px;background:rgba(7,24,37,0.75);backdrop-filter:blur(4px);border-radius:8px;padding:5px 12px;font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:1px;pointer-events:none}
`;

/* ═══════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════ */
const VIBES=[
  {id:"adventure",label:"Adventure",icon:"🧗"},{id:"foodie",label:"Foodie",icon:"🍝"},
  {id:"cultural",label:"Cultural",icon:"🏛"},{id:"romantic",label:"Romantic",icon:"♡"},
  {id:"hiking",label:"Hiking",icon:"🥾"},{id:"relaxation",label:"Relaxation",icon:"🌅"},
  {id:"solo",label:"Solo",icon:"🧳"},{id:"nightlife",label:"Nightlife",icon:"🌙"},
  {id:"budget",label:"Budget",icon:"💸"},{id:"luxury",label:"Luxury",icon:"✦"},
];

const DAYS_SICILY=[
  {day:"Day 01",name:"Arrival & Palermo",theme:"Settle in, wander the markets",date:"May 12",photos:["🌅","🏘","🌿"],
   blocks:[
    {type:"transport",ico:"✈",bg:"#FCE8E8",title:"Flight JFK → Palermo (PMO)",detail:"Alitalia AZ 601 · Departs 9:40am · Arrives 8:25am+1",price:"$680",status:"booked",cancel:"Free cancel by Apr 12",cancelSafe:true,conf:"AZ-2840392"},
    {type:"stay",ico:"🏨",bg:"#E3EEF5",title:"Massimo Hotel Palermo",detail:"Corso Vittorio Emanuele · Deluxe Double · Breakfast incl.",price:"$142/nt",status:"booked",cancel:"Free cancel by May 10",cancelSafe:false,conf:"BK-7291038"},
    {type:"food",ico:"🍽",bg:"#FEF0E6",title:"Mercato Ballaro street dinner",detail:"~€15pp · eat your way through the market",price:"~$18",status:"pending",cancel:null,conf:null},
  ]},
  {day:"Day 02",name:"Palermo Deep Dive",theme:"Baroque, street food, hidden churches",date:"May 13",photos:["🕌","🎨"],
   blocks:[
    {type:"activity",ico:"🏛",bg:"#EEF0FA",title:"Cappella Palatina Tour",detail:"Byzantine mosaics · Book early, queues by 10am",price:"$18",status:"booked",cancel:"No refund after booking",cancelSafe:false,conf:"GYG-88204"},
    {type:"food",ico:"🍽",bg:"#FEF0E6",title:"Trattoria Ai Cascinari",detail:"Pasta alla norma is non-negotiable",price:"~$28",status:"pending",cancel:null,conf:null},
    {type:"activity",ico:"🎭",bg:"#EEF0FA",title:"Ballarò street art walk",detail:"2hr self-guided loop · Free",price:"$0",status:"booked",cancel:"N/A",cancelSafe:true,conf:null},
  ]},
  {day:"Day 03",name:"Agrigento Day Trip",theme:"Valley of the Temples at golden hour",date:"May 14",photos:[],
   blocks:[
    {type:"transport",ico:"🚌",bg:"#FCE8E8",title:"Train: Palermo → Agrigento",detail:"Depart 8:05am · 2hr · Trenitalia",price:"$12",status:"pending",cancel:"Free cancel any time",cancelSafe:true,conf:null},
    {type:"activity",ico:"🏛",bg:"#EEF0FA",title:"Valley of the Temples",detail:"Arrive by 4pm for golden light · Book online",price:"$16",status:"booked",cancel:"Free cancel by May 12",cancelSafe:true,conf:"VIA-49201"},
  ]},
];

const CHECKLIST_DATA=[
  {label:"Book international flights",deadline:"ASAP",done:true},
  {label:"Reserve Hotel Massimo (3 nights)",deadline:"Book now",done:true},
  {label:"Travel insurance",deadline:"Before depart",done:false},
  {label:"Book Cappella Palatina tickets",deadline:"1 wk out",done:true},
  {label:"Reserve Trattoria Ai Cascinari",deadline:"2 wks out",done:false},
  {label:"Valley of the Temples entry",deadline:"3 days out",done:false},
  {label:"Download offline maps",deadline:"Night before",done:false},
];

const INSIGHTS_SICILY=[
  {c:"#5BAD7A",t:"Sicily in May avoids summer crowds. Consistent sunshine, lower hotel rates.",src:"840 reviews · TripAdvisor, GetYourGuide"},
  {c:"#D4A843",t:"Agrigento tours sell out. Book 5+ days ahead to avoid missing entry.",src:"220+ Viator reviews"},
  {c:"#D46B6B",t:"Budget €20–30/day food if eating local. Over-planning restaurants wastes spend.",src:"Reddit r/solotravel · 45 mentions"},
];

const COMMUNITY_CARDS=[
  {flag:"🌋",dest:"Amalfi Coast",country:"Italy",meta:"7 days · 2 travelers · $2,800",tags:["Romantic","Coastal"],author:"M",name:"mara.v",votes:214,photos:["🚤","⛵","🌊"],highlight:"#EEF0FA"},
  {flag:"🌵",dest:"Oaxaca",country:"Mexico",meta:"5 days · 1 traveler · $900",tags:["Cultural","Budget"],author:"J",name:"j.ramos",votes:188,photos:["🎨","🌮","🌄"],highlight:"#FEF0E6"},
  {flag:"🏔",dest:"Salkantay Trek",country:"Peru",meta:"8 days · 4 travelers · $1,400pp",tags:["Hiking","Adventure"],author:"A",name:"alyssa.t",votes:341,photos:["⛰","🦙","🌿"],highlight:"#E3EEF5"},
  {flag:"🌸",dest:"Kyoto",country:"Japan",meta:"6 days · 2 travelers · $3,100",tags:["Cultural","Slow Travel"],author:"K",name:"koda.s",votes:276,photos:["⛩","🍵","🌸"],highlight:"#F5F0FA"},
  {flag:"🏄",dest:"Lisbon",country:"Portugal",meta:"4 days · 3 travelers · $1,200",tags:["Budget","Foodie"],author:"P",name:"priya.n",votes:159,photos:["🛸","🐟","🏖"],highlight:"#E8F4EE"},
  {flag:"🦅",dest:"Patagonia",country:"Argentina",meta:"12 days · 3 travelers · $2,600pp",tags:["Hiking","Wild"],author:"M",name:"marcos.g",votes:422,photos:["🏔","🌬","🦅"],highlight:"#E3EEF5"},
];

const FRIENDS_FEED=[
  {user:"Sara K.",initial:"S",color:"#4A6FA5",action:"just posted photos from",dest:"Cinque Terre, Italy",time:"2h ago",meta:"5 days · 2 travelers · $1,800",tags:["Coastal","Romantic"],photos:["🌊","🏘","🍋"],flag:"🌊",votes:47},
  {user:"James R.",initial:"J",color:"#3A7D5A",action:"shared their itinerary for",dest:"Bali, Indonesia",time:"Yesterday",meta:"10 days · 1 traveler · $1,400",tags:["Adventure","Cultural"],photos:["🌺","🌊","🛕"],flag:"🌺",votes:89},
  {user:"Mia C.",initial:"M",color:"#8A4F3A",action:"completed a trip to",dest:"Morocco",time:"3 days ago",meta:"8 days · 4 travelers · $2,200",tags:["Cultural","Foodie"],photos:["🏜","🕌","🌶"],flag:"🏜",votes:134},
];

const HISTORY_TRIPS=[
  {icon:"🏔",dest:"Salkantay Trek, Peru",meta:"Mar 2024 · 8 days · Hiking",rank:"#1 of my life"},
  {icon:"🇮🇹",dest:"Rome & Naples, Italy",meta:"Oct 2023 · 7 days · Foodie",rank:"#2 overall"},
  {icon:"🏜",dest:"Sedona, Arizona",meta:"Jan 2024 · 4 days · Hiking",rank:"#3 overall"},
  {icon:"🇵🇹",dest:"Porto, Portugal",meta:"May 2023 · 5 days · Slow travel",rank:"#4 overall"},
];

const TOUR_GROUPS={
  "Hot Air Balloon":[
    {id:1,company:"Royal Balloon",price:195,rating:4.9,reviews:4820,duration:"1.5 hrs",badge:"Best Seller",groupSize:"Max 16",pickup:true,cancel:"Free cancel <24h",tags:["Sunrise","Champagne","Small group"],snippet:"\"Worth every penny — champagne at sunrise was unforgettable\""},
    {id:2,company:"Butterfly Balloons",price:165,rating:4.7,reviews:2310,duration:"1.5 hrs",badge:"Top Rated",groupSize:"Max 20",pickup:true,cancel:"Free cancel <48h",tags:["Budget pick","Hotel pickup"],snippet:"\"Great value, larger basket but still magical\""},
    {id:3,company:"Voyager Balloons",price:220,rating:4.8,reviews:1890,duration:"2 hrs",badge:"Premium",groupSize:"Max 8",pickup:true,cancel:"Non-refundable",tags:["Private option","Gourmet brkfst"],snippet:"\"Extra hour makes a huge difference for photos\""},
    {id:4,company:"Kapadokya Balloons",price:145,rating:4.5,reviews:980,duration:"1 hr",badge:null,groupSize:"Max 24",pickup:false,cancel:"Free cancel <24h",tags:["Budget","No frills"],snippet:"\"Does the job, no champagne but still flew\""},
  ],
  "Underground City Tour":[
    {id:5,company:"Cappadocia Tours Co.",price:55,rating:4.7,reviews:2341,duration:"Full day",badge:"Top Rated",groupSize:"Max 15",pickup:true,cancel:"Free cancel <24h",tags:["Lunch incl.","2 sites"],snippet:"\"Guide made history come alive\""},
    {id:6,company:"Middle Earth Travel",price:48,rating:4.6,reviews:1120,duration:"8 hrs",badge:null,groupSize:"Max 20",pickup:true,cancel:"Free cancel <48h",tags:["Flexible stops"],snippet:"\"Relaxed itinerary, not rushed\""},
    {id:7,company:"Argos Tours",price:75,rating:4.9,reviews:650,duration:"Full day",badge:"Hidden gem",groupSize:"Max 8",pickup:true,cancel:"Non-refundable",tags:["Small group","Wine tasting"],snippet:"\"8-person max means zero crowds\""},
  ],
  "Pottery Workshop":[
    {id:8,company:"Red River Ceramics",price:38,rating:4.8,reviews:987,duration:"2 hrs",badge:"Unique exp.",groupSize:"Max 10",pickup:false,cancel:"Free cancel <24h",tags:["Take-home piece","Hands-on"],snippet:"\"My pot survived the flight home\""},
    {id:9,company:"Avanos Art Studio",price:28,rating:4.5,reviews:430,duration:"1.5 hrs",badge:null,groupSize:"Max 15",pickup:false,cancel:"Free cancel <24h",tags:["Budget pick","Beginner friendly"],snippet:"\"Short and sweet intro to the craft\""},
  ],
};
const ACTIVITY_LIST=Object.keys(TOUR_GROUPS).map((name,i)=>({
  name,icon:["🎈","🏛","🏺"][i],category:["Adventure","Cultural","Cultural"][i],
  minPrice:Math.min(...TOUR_GROUPS[name].map(t=>t.price)),
  maxPrice:Math.max(...TOUR_GROUPS[name].map(t=>t.price)),
  topRating:Math.max(...TOUR_GROUPS[name].map(t=>t.rating)),
  totalReviews:TOUR_GROUPS[name].reduce((a,t)=>a+t.reviews,0),
  companies:TOUR_GROUPS[name].length,
}));

const CONT=`M 60,95 L 75,80 L 90,78 L 105,82 L 120,75 L 135,78 L 145,90 L 148,105 L 140,118 L 125,125 L 108,128 L 90,125 L 72,118 Z M 160,65 L 175,58 L 195,55 L 210,58 L 225,52 L 240,55 L 255,60 L 265,68 L 270,80 L 268,95 L 260,108 L 245,115 L 225,118 L 205,115 L 188,108 L 172,98 L 162,85 Z M 265,108 L 278,105 L 290,110 L 295,120 L 292,132 L 280,138 L 268,132 L 263,120 Z M 285,55 L 300,48 L 318,45 L 338,48 L 355,52 L 370,58 L 382,68 L 388,80 L 385,95 L 375,108 L 358,115 L 338,118 L 315,115 L 298,105 L 287,92 L 283,78 Z M 390,60 L 402,55 L 418,52 L 432,55 L 445,62 L 452,72 L 448,85 L 438,95 L 422,100 L 405,98 L 393,88 L 388,75 Z M 430,95 L 442,92 L 455,98 L 462,110 L 458,125 L 445,132 L 432,128 L 425,115 Z`;

const PINS=[{x:225,y:85,city:"Rome"},{x:198,y:88,city:"Porto"},{x:365,y:70,city:"Tokyo"},{x:302,y:88,city:"Kathmandu"},{x:108,y:110,city:"Lima"},{x:130,y:95,city:"Sedona"},{x:85,y:88,city:"NYC"}];

// Map cluster data — each cluster has itineraries to show when selected
const CLUSTERS=[
  {x:105,y:100,count:248,label:"Americas",zoom:"out",region:"americas"},
  {x:215,y:82,count:512,label:"Europe",zoom:"out",region:"europe"},
  {x:340,y:78,count:381,label:"Asia",zoom:"out",region:"asia"},
  {x:158,y:135,count:87,label:"S. America",zoom:"out",region:"sameric",itins:[2,5]},
  {x:248,y:145,count:62,label:"Africa",zoom:"out",region:"africa",itins:[1,4]},
  {x:195,y:88,count:89,label:"Lisbon",zoom:"europe",region:"europe",itins:[4]},
  {x:210,y:78,count:124,label:"Paris",zoom:"europe",region:"europe",itins:[0,4]},
  {x:225,y:82,count:98,label:"Rome",zoom:"europe",region:"europe",itins:[0]},
  {x:238,y:70,count:67,label:"Prague",zoom:"europe",region:"europe",itins:[0,4]},
  {x:220,y:92,count:55,label:"Barcelona",zoom:"europe",region:"europe",itins:[0,4]},
  {x:295,y:85,count:76,label:"Bangkok",zoom:"asia",region:"asia",itins:[3]},
  {x:338,y:72,count:112,label:"Tokyo",zoom:"asia",region:"asia",itins:[3]},
  {x:318,y:80,count:88,label:"Bali",zoom:"asia",region:"asia",itins:[3]},
  {x:92,y:88,count:134,label:"NYC",zoom:"americas",region:"americas",itins:[2,5]},
  {x:108,y:105,count:93,label:"Lima",zoom:"americas",region:"americas",itins:[2]},
];

const HERO_DAYS=[
  {day:"Day 01",title:"Palermo Arrival",items:["Flight booked ✓","Hotel booked ✓","Ballaro market"]},
  {day:"Day 02",title:"Palermo Deep Dive",items:["Cappella Palatina","Ai Cascinari ✓","Street art walk"]},
  {day:"Day 03",title:"Agrigento",items:["Morning train","Valley of Temples ✓"]},
];

/* ═══════════════════════════════════════════════════════════════
   INTERACTIVE DISCOVER MAP  — scroll-to-zoom + click region
═══════════════════════════════════════════════════════════════ */
function DiscoverMap({onCitySelect, selectedCity}) {
  const [zoom,setZoom]=useState("out");
  const [scale,setScale]=useState(1);
  const [tx,setTx]=useState(0);
  const [ty,setTy]=useState(0);
  const svgRef=useRef(null);
  const LABELS={out:"World",europe:"Europe",asia:"Asia & Pacific",americas:"The Americas",sameric:"South America",africa:"Africa"};

  const handleWheel=useCallback(e=>{
    e.preventDefault();
    const factor=e.deltaY<0?1.18:0.85;
    setScale(s=>Math.min(Math.max(s*factor,1),5));
  },[]);

  const CITY_REGIONS=["europe","asia","americas"];
  const visible=CLUSTERS.filter(c=>c.zoom===zoom);

  return (
    <div
      className="map-outer"
      style={{height:300,cursor:"grab"}}
      onWheel={handleWheel}
    >
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.06}} viewBox="0 0 840 300" preserveAspectRatio="xMidYMid slice">
        {Array.from({length:22}).map((_,i)=><line key={`v${i}`} x1={i*40} y1={0} x2={i*40} y2={300} stroke="#fff" strokeWidth={0.5}/>)}
        {Array.from({length:10}).map((_,i)=><line key={`h${i}`} x1={0} y1={i*32} x2={840} y2={i*32} stroke="#fff" strokeWidth={0.5}/>)}
      </svg>
      <svg
        ref={svgRef}
        style={{position:"absolute",inset:0,width:"100%",height:"100%"}}
        viewBox="0 0 500 200"
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`scale(${scale}) translate(${tx},${ty})`} style={{transformOrigin:"250px 100px"}}>
          <path d={CONT} fill="rgba(196,96,58,0.1)" stroke="rgba(196,96,58,0.28)" strokeWidth={1.2/scale}/>
          {visible.map((c,i)=>{
            const r=c.count>200?18:c.count>80?14:11;
            const isSelected=selectedCity?.label===c.label;
            return (
              <g key={i} style={{cursor:"pointer"}} onClick={()=>{
                if(zoom==="out"){
                  if(CITY_REGIONS.includes(c.region)){ setZoom(c.region); onCitySelect(null); }
                  else { onCitySelect(isSelected?null:c); }
                } else { onCitySelect(isSelected?null:c); }
              }}>
                <circle cx={c.x} cy={c.y} r={(r+8)/scale} fill="rgba(196,96,58,0.08)"/>
                <circle cx={c.x} cy={c.y} r={r/scale}
                  fill={isSelected?"var(--gold)":zoom==="out"?"rgba(196,96,58,0.82)":"rgba(13,43,69,0.85)"}
                  stroke={isSelected?"rgba(201,168,76,0.6)":"rgba(255,255,255,0.35)"}
                  strokeWidth={1.5/scale}/>
                <text x={c.x} y={c.y+1} textAnchor="middle" dominantBaseline="middle"
                  fill="#fff" fontSize={7/scale} fontWeight={600} fontFamily="DM Mono">{c.count}</text>
                <text x={c.x} y={c.y+r/scale+8/scale} textAnchor="middle"
                  fill="rgba(255,255,255,0.55)" fontSize={6.5/scale} fontFamily="DM Sans">{c.label}</text>
              </g>
            );
          })}
        </g>
      </svg>
      <div style={{position:"absolute",top:14,left:18,background:"rgba(7,24,37,0.8)",backdropFilter:"blur(4px)",borderRadius:8,padding:"5px 14px",fontFamily:"DM Mono,monospace",fontSize:10,color:"rgba(255,255,255,0.8)",letterSpacing:1.5,display:"flex",alignItems:"center",gap:10}}>
        <span>{LABELS[zoom]?.toUpperCase()} · {visible.reduce((a,c)=>a+c.count,0).toLocaleString()} ITINERARIES</span>
        {zoom!=="out"&&<button onClick={()=>{setZoom("out");setScale(1);onCitySelect(null);}} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.7)",padding:"2px 10px",borderRadius:100,fontSize:9,cursor:"pointer"}}>← WORLD</button>}
      </div>
      <div className="map-hint">SCROLL TO ZOOM · CLICK REGION TO EXPLORE</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WORLD MAP — profile header
═══════════════════════════════════════════════════════════════ */
function WorldMapBg({children}) {
  const [hov,setHov]=useState(null);
  return (
    <div className="profile-map-header">
      {/* grid lines */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.06,pointerEvents:"none"}} viewBox="0 0 840 230" preserveAspectRatio="xMidYMid slice">
        {Array.from({length:22}).map((_,i)=><line key={`v${i}`} x1={i*40} y1={0} x2={i*40} y2={230} stroke="#fff" strokeWidth={0.5}/>)}
        {Array.from({length:9}).map((_,i)=><line key={`h${i}`} x1={0} y1={i*28} x2={840} y2={i*28} stroke="#fff" strokeWidth={0.5}/>)}
      </svg>
      {/* continent + pins — must NOT have pointerEvents:none so hover works */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",overflow:"visible"}} viewBox="0 0 500 170" preserveAspectRatio="xMidYMid meet">
        <path d={CONT} fill="rgba(196,96,58,0.18)" stroke="rgba(196,96,58,0.35)" strokeWidth={1.5} style={{pointerEvents:"none"}}/>
        {PINS.map((p,i)=>(
          <g key={i} style={{cursor:"pointer"}}
            onMouseEnter={()=>setHov(p)}
            onMouseLeave={()=>setHov(null)}>
            {/* larger invisible hit target */}
            <circle cx={p.x} cy={p.y} r={18} fill="transparent"/>
            <circle cx={p.x} cy={p.y} r={14} fill="rgba(196,96,58,0.1)" style={{pointerEvents:"none"}}/>
            <circle cx={p.x} cy={p.y} r={7} fill="var(--terra)" stroke="var(--gold-lt)" strokeWidth={1.5} style={{pointerEvents:"none"}}/>
            <circle cx={p.x} cy={p.y} r={3} fill="rgba(255,255,255,0.8)" style={{pointerEvents:"none"}}/>
            {hov?.city===p.city&&<g style={{pointerEvents:"none"}}>
              <rect x={p.x-28} y={p.y-32} width={56} height={18} rx={5} fill="var(--terra)"/>
              <text x={p.x} y={p.y-19} textAnchor="middle" fill="#fff" fontSize={8} fontFamily="DM Mono">{p.city}</text>
            </g>}
          </g>
        ))}
      </svg>
      {/* overlay — pointerEvents:none so it doesn't block SVG */}
      <div className="profile-overlay" style={{pointerEvents:"none"}}>
        <div style={{pointerEvents:"auto"}}>{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MODALS
═══════════════════════════════════════════════════════════════ */
function CompareModal({actName,tours,onClose,onAdd}) {
  const [picked,setPicked]=useState(null);
  const bestP=Math.min(...tours.map(t=>t.price));
  const bestR=Math.max(...tours.map(t=>t.rating));
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <div><div className="modal-title">Compare: {actName}</div><div className="modal-sub">{tours.length} companies · GetYourGuide & Viator · prices per person</div></div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <table className="compare-table" style={{marginBottom:16}}>
            <thead><tr><th>Company</th><th>Price</th><th>Rating</th><th>Reviews</th><th>Duration</th><th>Group</th><th>Cancellation</th><th></th></tr></thead>
            <tbody>{tours.map(t=>(
              <tr key={t.id}>
                <td><div style={{fontWeight:600,color:"var(--ink)",marginBottom:2}}>{t.company}</div>{t.badge&&<span style={{fontSize:9,padding:"2px 8px",borderRadius:100,background:t.badge==="Best Seller"?"var(--terra)":t.badge==="Premium"?"var(--ocean)":"var(--green)",color:"#fff",fontWeight:600,textTransform:"uppercase"}}>{t.badge}</span>}</td>
                <td className={t.price===bestP?"best-v":""}>${t.price}</td>
                <td style={{color:"var(--gold)",fontWeight:600}}>{t.rating===bestR?"★ ":""}{t.rating}</td>
                <td className={t.reviews===Math.max(...tours.map(x=>x.reviews))?"best-v":""}>{t.reviews.toLocaleString()}</td>
                <td style={{color:"var(--slate)",fontSize:12}}>{t.duration}</td>
                <td style={{color:"var(--slate)",fontSize:12}}>{t.groupSize}</td>
                <td style={{fontSize:11,color:t.cancel.startsWith("Free")?"var(--green)":"var(--red)"}}>{t.cancel}</td>
                <td><button className={`sel-btn ${picked===t.id?"on":""}`} onClick={()=>setPicked(picked===t.id?null:t.id)}>{picked===t.id?"✓ Selected":"Select"}</button></td>
              </tr>
            ))}</tbody>
          </table>
          {picked!==null&&(()=>{const t=tours.find(x=>x.id===picked);return(
            <div style={{background:"var(--foam)",borderRadius:14,padding:20,border:"1px solid var(--mist)"}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:"var(--ink)",marginBottom:6}}>{t.company}</div>
              <div style={{fontSize:13,color:"var(--slate)",fontStyle:"italic",marginBottom:12}}>{t.snippet}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
                {t.tags.map(tag=><span key={tag} style={{background:"#fff",border:"1px solid var(--mist)",borderRadius:100,padding:"4px 12px",fontSize:11,color:"var(--slate)"}}>✓ {tag}</span>)}
                {t.pickup&&<span style={{background:"rgba(46,125,79,0.1)",borderRadius:100,padding:"4px 12px",fontSize:11,color:"var(--green)"}}>✓ Hotel pickup</span>}
              </div>
              <button onClick={()=>onAdd(t,actName)} style={{background:"var(--terra)",color:"#fff",border:"none",padding:"11px 28px",borderRadius:100,fontSize:13,fontWeight:600,cursor:"pointer"}}>Add {t.company} to itinerary →</button>
            </div>
          );})()}
        </div>
      </div>
    </div>
  );
}

function ActivityModal({day,dest,onClose,onAdd}) {
  const [comparing,setComparing]=useState(null);
  const [filter,setFilter]=useState("All");
  const filtered=filter==="All"?ACTIVITY_LIST:ACTIVITY_LIST.filter(a=>a.category===filter);
  if(comparing) return <CompareModal actName={comparing} tours={TOUR_GROUPS[comparing]} onClose={()=>setComparing(null)} onAdd={(tour,an)=>onAdd(tour,an)}/>;
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <div>
            <div className="modal-title">Add Activity</div>
            <div className="modal-sub">{day} · {dest} · real data from GetYourGuide & Viator</div>
            <div style={{display:"flex",gap:6,marginTop:12}}>
              {["All","Adventure","Cultural"].map(c=><button key={c} onClick={()=>setFilter(c)} style={{padding:"6px 16px",borderRadius:100,border:"none",fontSize:12,fontWeight:500,cursor:"pointer",background:filter===c?"var(--ocean)":"var(--mist)",color:filter===c?"#fff":"var(--slate)"}}>{c}</button>)}
            </div>
          </div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {filtered.map(act=>(
            <div key={act.name} style={{background:"#fff",borderRadius:16,padding:18,border:"1.5px solid var(--mist)",marginBottom:10,cursor:"pointer",transition:"all 0.15s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="var(--terra)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="var(--mist)"}>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                <div style={{width:52,height:52,borderRadius:14,background:act.category==="Adventure"?"#EEF0FA":"#E3EEF5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{act.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:"var(--ink)",marginBottom:3}}>{act.name}</div>
                  <div style={{display:"flex",gap:14,fontSize:12,color:"var(--slate)"}}>
                    <span>★ up to {act.topRating}</span>
                    <span>{act.totalReviews.toLocaleString()} total reviews</span>
                    <span style={{color:"var(--terra)",fontWeight:500}}>${act.minPrice}–${act.maxPrice}/person</span>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
                  <div style={{fontSize:11,color:"var(--slate)",fontFamily:"DM Mono,monospace"}}>{act.companies} companies</div>
                  <button onClick={()=>setComparing(act.name)} style={{background:"var(--terra)",color:"#fff",border:"none",padding:"9px 18px",borderRadius:100,fontSize:12,fontWeight:600,cursor:"pointer"}}>⇄ Compare</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const BLOCK_TYPES=[
  {id:"stay",ico:"🏨",label:"Accommodation",bg:"#E3EEF5"},
  {id:"activity",ico:"🏔",label:"Activity / Tour",bg:"#EEF0FA"},
  {id:"food",ico:"🍽",label:"Restaurant",bg:"#FEF0E6"},
  {id:"transport",ico:"✈",label:"Transport",bg:"#FCE8E8"},
  {id:"note",ico:"📝",label:"Note / Reminder",bg:"#F0F4F8"},
];

function TypePicker({onSelect,onClose}) {
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="type-box">
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"var(--ink)",marginBottom:4}}>What are you adding?</div>
        <div style={{fontSize:13,color:"var(--slate)",marginBottom:20}}>Choose a block type</div>
        {BLOCK_TYPES.map(bt=>(
          <button key={bt.id} className="tpick-btn" onClick={()=>onSelect(bt)}>
            <div className="tpick-ico" style={{background:bt.bg}}>{bt.ico}</div>
            <div className="tpick-lbl">{bt.label}</div>
            <span style={{marginLeft:"auto",color:"var(--mist)"}}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TRIP REFLECTION MODAL
═══════════════════════════════════════════════════════════════ */
const CHANGE_OPTIONS=["Different hotel","Fewer activities","More downtime","Different season","Nothing — I'd repeat it exactly"];
const REBOOK_OPTIONS=["Absolutely","Probably","Only if cheaper","No"];

function ReflectModal({dest,onClose,onSave}) {
  const [step,setStep]=useState(0);
  const [rank,setRank]=useState(50);
  const [expect,setExpect]=useState(null);
  const [sentence,setSentence]=useState("");
  const [change,setChange]=useState([]);
  const [changeCustom,setChangeCustom]=useState("");
  const [bestDecision,setBestDecision]=useState("");
  const [regret,setRegret]=useState("");
  const [rebook,setRebook]=useState({});
  const [title,setTitle]=useState("");
  const [editing,setEditing]=useState(false);

  const RANK_LABELS=["Worst trip I've taken","Solid but not top-tier","One of my favorites","Top 3 of my life"];
  const getRankLabel=v=>v<25?RANK_LABELS[0]:v<50?RANK_LABELS[1]:v<75?RANK_LABELS[2]:RANK_LABELS[3];
  const BLOCKS_TO_REBOOK=["Massimo Hotel Palermo","Cappella Palatina Tour","Valley of the Temples"];

  const STEPS=[
    {q:"Where does this trip rank for you?",n:"Big Picture"},
    {q:"Did this trip match what you expected?",n:"Expectation"},
    {q:"What would you tell future-you about this trip?",n:"Future-You Note"},
    {q:"If you could redo this trip, what would you swap?",n:"What to Change"},
    {q:"What was the best decision you made?",n:"Best Decision"},
    {q:"Anything you'd skip next time?",n:"Skip Next Time"},
    {q:"Would you rebook these experiences?",n:"Experience Ratings"},
    {q:"Give this trip a title",n:"Title & Photos"},
  ];

  const canNext=()=>{
    if(step===1&&!expect)return false;
    return true;
  };

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:620}}>
        <div className="modal-hd">
          <div>
            <div className="modal-title">Trip Reflection{editing?" (editing)":""} — {dest}</div>
            <div className="modal-sub" style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
              {STEPS.map((s,i)=>(
                <span key={i} style={{padding:"3px 10px",borderRadius:100,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:0.5,cursor:"pointer",
                  background:i===step?"var(--terra)":i<step?"var(--ocean)":"var(--mist)",
                  color:i<=step?"#fff":"var(--slate)"
                }} onClick={()=>setStep(i)}>{i+1}</span>
              ))}
            </div>
          </div>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{padding:"28px"}}>

          {/* Step indicator */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
            <span style={{background:"var(--ocean)",color:"#fff",fontFamily:"DM Mono,monospace",fontSize:10,padding:"3px 10px",borderRadius:100,letterSpacing:1}}>
              {step+1} of {STEPS.length}
            </span>
            <span style={{fontSize:12,color:"var(--slate)",fontFamily:"DM Mono,monospace",letterSpacing:1}}>{STEPS[step].n.toUpperCase()}</span>
          </div>

          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:"var(--ink)",marginBottom:20,lineHeight:1.2}}>
            {STEPS[step].q}
          </div>

          {/* STEP 0: slider ranking */}
          {step===0&&<>
            <div style={{fontSize:24,textAlign:"center",marginBottom:8,fontFamily:"'Cormorant Garamond',serif",fontWeight:700,color:"var(--terra)"}}>{getRankLabel(rank)}</div>
            <div className="slider-wrap">
              <input type="range" min={0} max={100} value={rank} onChange={e=>setRank(+e.target.value)} className="slider-track"/>
              <div className="slider-labels">
                <span>Worst ever</span><span>Solid</span><span>Favorite</span><span>Top 3</span>
              </div>
            </div>
          </>}

          {/* STEP 1: expectation match */}
          {step===1&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
            {["Better than expected","Exactly what I imagined","Slightly disappointing","Not what I hoped for"].map(opt=>(
              <button key={opt} onClick={()=>setExpect(opt)} style={{padding:"14px 20px",borderRadius:14,border:`1.5px solid ${expect===opt?"var(--terra)":"var(--mist)"}`,background:expect===opt?"rgba(196,96,58,0.06)":"#fff",fontSize:14,color:expect===opt?"var(--terra)":"var(--ink)",cursor:"pointer",textAlign:"left",transition:"all 0.15s",fontWeight:expect===opt?600:400}}>
                {expect===opt?"✓ ":""}{opt}
              </button>
            ))}
          </div>}

          {/* STEP 2: future-you note */}
          {step===2&&<>
            <textarea value={sentence} onChange={e=>setSentence(e.target.value)} placeholder='e.g. "Worth it for the views — skip the breakfast." or "Book the early tour, not the afternoon."'
              style={{width:"100%",minHeight:120,padding:"14px 16px",borderRadius:14,border:"1.5px solid var(--mist)",background:"var(--foam)",fontSize:14,color:"var(--ink)",outline:"none",resize:"vertical",lineHeight:1.65}}/>
            <div style={{fontSize:11,color:"var(--slate)",marginTop:8,fontStyle:"italic"}}>This becomes a personal note visible only to you — and anonymized insight for future travelers.</div>
          </>}

          {/* STEP 3: what would you change */}
          {step===3&&<>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
              {CHANGE_OPTIONS.map(opt=>(
                <button key={opt} onClick={()=>setChange(p=>p.includes(opt)?p.filter(x=>x!==opt):[...p,opt])}
                  style={{padding:"9px 16px",borderRadius:100,border:`1.5px solid ${change.includes(opt)?"var(--ocean)":"var(--mist)"}`,background:change.includes(opt)?"var(--ocean)":"#fff",color:change.includes(opt)?"#fff":"var(--ink)",fontSize:13,cursor:"pointer",transition:"all 0.15s"}}>
                  {change.includes(opt)?"✓ ":""}{opt}
                </button>
              ))}
            </div>
            <input value={changeCustom} onChange={e=>setChangeCustom(e.target.value)} className="form-inp" placeholder="Or describe in your own words..."/>
          </>}

          {/* STEP 4: best decision */}
          {step===4&&<textarea value={bestDecision} onChange={e=>setBestDecision(e.target.value)} placeholder='e.g. "Booking the small-group tour instead of the big bus." or "Staying in the old town center."'
            style={{width:"100%",minHeight:100,padding:"14px 16px",borderRadius:14,border:"1.5px solid var(--mist)",background:"var(--foam)",fontSize:14,color:"var(--ink)",outline:"none",resize:"vertical",lineHeight:1.65}}/>}

          {/* STEP 5: regret */}
          {step===5&&<textarea value={regret} onChange={e=>setRegret(e.target.value)} placeholder='e.g. "The 3-hour boat tour — rough seas and not worth the price." Keep it casual.'
            style={{width:"100%",minHeight:100,padding:"14px 16px",borderRadius:14,border:"1.5px solid var(--mist)",background:"var(--foam)",fontSize:14,color:"var(--ink)",outline:"none",resize:"vertical",lineHeight:1.65}}/>}

          {/* STEP 6: rebook */}
          {step===6&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
            {BLOCKS_TO_REBOOK.map(b=>(
              <div key={b} style={{background:"#fff",borderRadius:14,padding:"14px 16px",border:"1.5px solid var(--mist)"}}>
                <div style={{fontSize:14,fontWeight:500,color:"var(--ink)",marginBottom:10}}>{b}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {REBOOK_OPTIONS.map(opt=>(
                    <button key={opt} onClick={()=>setRebook(p=>({...p,[b]:opt}))}
                      style={{padding:"7px 14px",borderRadius:100,border:`1.5px solid ${rebook[b]===opt?"var(--ocean)":"var(--mist)"}`,background:rebook[b]===opt?"var(--ocean)":"#fff",color:rebook[b]===opt?"#fff":"var(--slate)",fontSize:12,cursor:"pointer",transition:"all 0.15s"}}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>}

          {/* STEP 7: title + photos */}
          {step===7&&<>
            <div style={{marginBottom:16}}>
              <label className="form-label">Give this trip a title</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} className="form-inp" placeholder='e.g. "September Sicily Food Sprint" or "The Trip That Changed Everything"'/>
              <div style={{fontSize:11,color:"var(--slate)",marginTop:6,fontStyle:"italic"}}>A great title makes it easier to find, share, and feel proud of.</div>
            </div>
            <div>
              <label className="form-label">Add photos from your trip</label>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                {["🌅","🏛","🍝","🌊"].map((p,i)=>(
                  <div key={i} style={{width:80,height:64,borderRadius:12,background:"var(--foam)",border:"2px solid var(--mist)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,cursor:"pointer"}}>
                    {p}
                  </div>
                ))}
                <button style={{width:80,height:64,borderRadius:12,border:"1.5px dashed var(--mist)",background:"none",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,cursor:"pointer",color:"var(--slate)",fontSize:11}}>
                  <span style={{fontSize:20}}>+</span>Upload
                </button>
              </div>
            </div>
            <div style={{marginTop:20,padding:16,background:"rgba(201,168,76,0.08)",borderRadius:12,border:"1px solid rgba(201,168,76,0.2)"}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:4}}>Your reflection summary</div>
              <div style={{fontSize:12,color:"var(--slate)",lineHeight:1.7}}>
                <div>🏆 Ranked: <strong style={{color:"var(--terra)"}}>{getRankLabel(rank)}</strong></div>
                {expect&&<div>💭 Expectation: <strong>{expect}</strong></div>}
                {sentence&&<div>📝 Note: <em>"{sentence.slice(0,60)}{sentence.length>60?"...":""}"</em></div>}
              </div>
            </div>
          </div>}

          {/* Nav */}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:28,paddingTop:20,borderTop:"1px solid var(--mist)"}}>
            <button onClick={()=>setStep(s=>Math.max(0,s-1))} style={{padding:"10px 22px",borderRadius:100,border:"1.5px solid var(--mist)",background:"none",fontSize:13,color:"var(--slate)",cursor:step===0?"not-allowed":"pointer",opacity:step===0?0.4:1}}>← Back</button>
            <div style={{display:"flex",gap:10}}>
              {step<STEPS.length-1?(
                <button onClick={()=>canNext()&&setStep(s=>s+1)} style={{padding:"10px 28px",borderRadius:100,background:canNext()?"var(--terra)":"var(--mist)",color:canNext()?"#fff":"var(--slate)",border:"none",fontSize:13,fontWeight:600,cursor:canNext()?"pointer":"not-allowed",transition:"all 0.15s"}}>
                  Next →
                </button>
              ):(
                <button onClick={()=>onSave({rank,expect,sentence,change,bestDecision,regret,rebook,title})} style={{padding:"10px 28px",borderRadius:100,background:"var(--ocean)",color:"#fff",border:"none",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                  Save reflection ✓
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHOTO STRIP
═══════════════════════════════════════════════════════════════ */
function PhotoStrip({photos}) {
  return (
    <div className="photo-strip">
      {photos.map((p,i)=>(
        <div key={i} className="photo-thumb">{p}</div>
      ))}
      <button className="photo-add"><span style={{fontSize:18}}>+</span><span>Photo</span></button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EXISTING TRIP
═══════════════════════════════════════════════════════════════ */
function ExistingTrip() {
  const [exp,setExp]=useState({0:true,1:false,2:false});
  const [cl,setCl]=useState(CHECKLIST_DATA);
  const [selVibes,setSelVibes]=useState(["foodie","cultural","romantic"]);
  const [showReflect,setShowReflect]=useState(false);
  const [reflected,setReflected]=useState(null);
  const [editing,setEditing]=useState(false);
  const [details,setDetails]=useState({
    dest:"Sicily, Italy",
    dates:"May 12–19",
    days:"7",
    travelers:"2",
    budget:"3,200",
    theme:"Foodie escape with culture and coastal stops",
  });
  const [draftDetails,setDraftDetails]=useState({...details});
  const toggleVibe=id=>setSelVibes(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);

  const saveDetails=()=>{ setDetails({...draftDetails}); setEditing(false); };
  const cancelEdit=()=>{ setDraftDetails({...details}); setEditing(false); };

  return <>
    {!reflected?(
      <div className="reflect-banner">
        <div style={{width:44,height:44,borderRadius:12,background:"rgba(201,168,76,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🌄</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:2}}>Your Sicily trip just ended</div>
          <div style={{fontSize:12,color:"var(--slate)"}}>Close the loop — reflect, rank, share photos, and help future travelers</div>
        </div>
        <button className="reflect-cta" onClick={()=>setShowReflect(true)}>Reflect on this trip →</button>
      </div>
    ):(
      <div style={{background:"linear-gradient(135deg,var(--ocean),var(--tide))",borderRadius:16,padding:"16px 24px",marginBottom:24,display:"flex",alignItems:"center",gap:12,border:"1px solid rgba(201,168,76,0.2)"}}>
        <span style={{fontSize:20}}>✓</span>
        <div style={{flex:1}}>
          <span style={{color:"rgba(255,255,255,0.85)",fontSize:13}}>Reflection saved — <em style={{color:"var(--gold-lt)"}}>"{reflected.title || "Sicily Trip"}"</em> · Ranked: {reflected.expect}</span>
        </div>
        <button onClick={()=>setShowReflect(true)} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.7)",padding:"6px 14px",borderRadius:100,fontSize:11,cursor:"pointer"}}>Edit reflection</button>
      </div>
    )}

    {/* TRIP HEADER — view or edit mode */}
    <div style={{marginBottom:24}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
        <div className="pg-eyebrow">My Itineraries · {details.dest}</div>
        {!editing
          ? <button onClick={()=>setEditing(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 16px",borderRadius:100,border:"1.5px solid var(--mist)",background:"none",fontSize:12,color:"var(--slate)",cursor:"pointer",transition:"all 0.15s",flexShrink:0}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--terra)";e.currentTarget.style.color="var(--terra)"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--mist)";e.currentTarget.style.color="var(--slate)"}}>
              ✏ Edit details
            </button>
          : <div style={{display:"flex",gap:8}}>
              <button onClick={cancelEdit} style={{padding:"7px 16px",borderRadius:100,border:"1.5px solid var(--mist)",background:"none",fontSize:12,color:"var(--slate)",cursor:"pointer"}}>Cancel</button>
              <button onClick={saveDetails} style={{padding:"7px 18px",borderRadius:100,background:"var(--terra)",color:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer"}}>Save changes</button>
            </div>
        }
      </div>

      {!editing ? (
        <>
          <div className="pg-title">{details.dest}</div>
          <div style={{fontSize:14,color:"var(--slate)",marginBottom:6}}>{details.dates} · {details.days} days · {details.travelers} total travelers · ${details.budget} budget</div>
          {details.theme&&<div style={{fontSize:13,color:"var(--slate)",fontStyle:"italic",marginBottom:18}}>"{details.theme}"</div>}
        </>
      ) : (
        <div style={{background:"#fff",borderRadius:16,border:"1.5px solid var(--terra)",padding:24,marginTop:8}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:"var(--ink)",marginBottom:16}}>Edit Trip Details</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div style={{gridColumn:"1/-1"}}>
              <label className="form-label">Destination</label>
              <input className="form-inp" value={draftDetails.dest} onChange={e=>setDraftDetails(p=>({...p,dest:e.target.value}))}/>
            </div>
            <div>
              <label className="form-label">Dates</label>
              <input className="form-inp" value={draftDetails.dates} onChange={e=>setDraftDetails(p=>({...p,dates:e.target.value}))} placeholder="e.g. May 12–19"/>
            </div>
            <div>
              <label className="form-label">Number of days</label>
              <input className="form-inp" value={draftDetails.days} onChange={e=>setDraftDetails(p=>({...p,days:e.target.value}))}/>
            </div>
            <div>
              <label className="form-label">Total number of travelers <span style={{color:"var(--terra)",fontFamily:"normal",textTransform:"none",letterSpacing:0,fontSize:11}}>(incl. yourself)</span></label>
              <input className="form-inp" value={draftDetails.travelers} onChange={e=>setDraftDetails(p=>({...p,travelers:e.target.value}))} placeholder="e.g. 2"/>
            </div>
            <div>
              <label className="form-label">Total budget ($)</label>
              <input className="form-inp" value={draftDetails.budget} onChange={e=>setDraftDetails(p=>({...p,budget:e.target.value}))} placeholder="e.g. 3200"/>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label className="form-label">Trip theme / goal</label>
              <input className="form-inp" value={draftDetails.theme} onChange={e=>setDraftDetails(p=>({...p,theme:e.target.value}))} placeholder="e.g. Foodie escape with culture stops"/>
            </div>
          </div>
          <div>
            <label className="form-label">Trip vibes <span style={{color:"var(--terra)",fontFamily:"normal",textTransform:"none",letterSpacing:0,fontSize:11}}>(select all that apply)</span></label>
            <div className="vibe-grid" style={{marginTop:8}}>
              {VIBES.map(v=>(
                <div key={v.id} className={`vibe-chip ${selVibes.includes(v.id)?"on":""}`} onClick={()=>toggleVibe(v.id)}>
                  <div className="chip-dot"/>{v.icon} {v.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* vibes shown in view mode */}
      {!editing&&(
        <div className="vibe-grid">
          {VIBES.map(v=>(
            <div key={v.id} className={`vibe-chip ${selVibes.includes(v.id)?"on":""}`} onClick={()=>toggleVibe(v.id)}>
              <div className="chip-dot"/>{v.icon} {v.label}
            </div>
          ))}
        </div>
      )}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:24}}>
      <div>
        <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"var(--slate)",letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>Itinerary + Confirmations</div>
        <div className="days-col">
          {DAYS_SICILY.map((day,i)=>(
            <div key={i} className="iday">
              <div className="iday-hd" onClick={()=>setExp(p=>({...p,[i]:!p[i]}))}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div className="iday-badge">{day.day}</div>
                  <div><div className="iday-name">{day.name}</div><div className="iday-sub">{day.date} · {day.theme}</div></div>
                </div>
                <span style={{color:"var(--terra)",fontSize:18}}>{exp[i]?"−":"+"}</span>
              </div>
              {exp[i]&&<div className="iday-body">
                <PhotoStrip photos={day.photos}/>
                {day.blocks.map((b,j)=>(
                  <div key={j} className="block">
                    <div className="block-ico" style={{background:b.bg}}>{b.ico}</div>
                    <div className="block-body">
                      <div className="block-title">{b.title}</div>
                      <div className="block-detail">{b.detail}</div>
                      {b.conf&&<div style={{fontSize:10,color:"var(--ocean)",fontFamily:"DM Mono,monospace",marginTop:3}}>CONF #{b.conf}</div>}
                      {b.cancel&&<div className={`block-cancel ${b.cancelSafe?"safe":""}`}>
                        {b.cancelSafe?"✓":"⚠"} {b.cancel}
                      </div>}
                    </div>
                    <div className="block-right">
                      <div className="block-price">{b.price}</div>
                      <div className={b.status==="booked"?"pill-booked":"pill-pending"}>{b.status}</div>
                      {b.status==="pending"&&<button className="book-link">Book →</button>}
                    </div>
                  </div>
                ))}
                <button className="add-row">+ Add accommodation, activity, restaurant, or note</button>
              </div>}
            </div>
          ))}
        </div>
        <div className="ck-panel">
          <div className="ck-title">Smart Booking Checklist</div>
          <div className="ck-sub">Track what needs to be booked and when</div>
          {cl.map((item,i)=>(
            <div key={i} className="ck-row">
              <div className={`ck-box ${item.done?"done":""}`} onClick={()=>setCl(p=>p.map((c,idx)=>idx===i?{...c,done:!c.done}:c))}>{item.done&&"✓"}</div>
              <div className={`ck-label ${item.done?"done":""}`}>{item.label}</div>
              <div className="ck-dead">{item.deadline}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="intel-panel">
          <div className="intel-title">Trip Intelligence</div>
          <div className="intel-sub">From 1,060+ synthesized reviews</div>
          {INSIGHTS_SICILY.map((ins,i)=>(
            <div key={i} className="intel-row">
              <div className="intel-dot" style={{background:ins.c}}/>
              <div><div className="intel-text">{ins.t}</div><div className="intel-src">{ins.src}</div></div>
            </div>
          ))}
        </div>
        <div className="budget-panel">
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:"var(--ink)",marginBottom:14}}>Budget Tracker</div>
          {[{label:"Flights",spent:680,budget:700},{label:"Accommodation",spent:710,budget:800},{label:"Activities",spent:180,budget:400},{label:"Food & drink",spent:90,budget:600}].map((b,i)=>(
            <div key={i} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                <span style={{color:"var(--ink)"}}>{b.label}</span>
                <span style={{fontFamily:"DM Mono,monospace",color:"var(--slate)",fontSize:11}}>${b.spent} / ${b.budget}</span>
              </div>
              <div className="bbar"><div className="bbar-fill" style={{width:`${(b.spent/b.budget)*100}%`,background:b.spent>b.budget?"var(--red)":"var(--terra)"}}/></div>
            </div>
          ))}
        </div>
      </div>
    </div>
    {showReflect&&<ReflectModal dest="Sicily, Italy" onClose={()=>setShowReflect(false)} onSave={d=>{setReflected(d);setShowReflect(false);}}/>}
  </>;
}

/* ═══════════════════════════════════════════════════════════════
   DISCOVER VIEW
═══════════════════════════════════════════════════════════════ */
function DiscoverView() {
  const [feedTab,setFeedTab]=useState("community");
  const [filter,setFilter]=useState("Trending");
  const [selectedCity,setSelectedCity]=useState(null);

  // cards to show based on selected city or default
  const cityCards=selectedCity?.itins
    ? selectedCity.itins.map(i=>COMMUNITY_CARDS[i])
    : COMMUNITY_CARDS;

  return <>
    <div style={{marginBottom:24}}>
      <div className="pg-eyebrow">Explore</div>
      <div className="pg-title">Discover Itineraries</div>
      <div style={{fontSize:14,color:"var(--slate)"}}>Real trips built by real travelers. Fork any itinerary and make it yours.</div>
    </div>

    <DiscoverMap onCitySelect={setSelectedCity} selectedCity={selectedCity}/>

    {selectedCity&&(
      <div style={{background:"#fff",borderRadius:14,border:"1.5px solid var(--mist)",padding:"14px 20px",marginTop:12,marginBottom:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:"var(--ink)",marginBottom:2}}>{selectedCity.label}</div>
          <div style={{fontSize:12,color:"var(--slate)"}}>{selectedCity.count} itineraries · Showing top-rated below</div>
        </div>
        <button onClick={()=>setSelectedCity(null)} style={{background:"none",border:"1.5px solid var(--mist)",color:"var(--slate)",padding:"7px 16px",borderRadius:100,fontSize:12,cursor:"pointer"}}>✕ Clear</button>
      </div>
    )}

    <div style={{height:1,background:"var(--mist)",margin:"20px 0"}}/>

    <div className="discover-tabs">
      {["community","friends"].map(t=>(
        <button key={t} className={`dtab ${feedTab===t?"active":""}`} onClick={()=>setFeedTab(t)}>
          {t==="community"?"🌍 Community":"👥 Friends"}
          {t==="friends"&&<span style={{marginLeft:8,fontSize:9,padding:"2px 7px",background:"var(--terra)",color:"#fff",borderRadius:100}}>3 new</span>}
        </button>
      ))}
    </div>

    {feedTab==="community"&&<>
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {["Trending","Hiking","Foodie","Budget","Couples","Solo","Adventure"].map(f=>(
          <button key={f} className={`fchip ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>{f}</button>
        ))}
      </div>
      {selectedCity&&<div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"var(--terra)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:14}}>Showing itineraries tagged "{selectedCity.label}"</div>}
      <div className="card-grid">
        {cityCards.map((card,i)=>(
          <div key={i} className="ccard">
            <div className="ccard-img" style={{background:card.highlight}}>
              <div style={{fontSize:52}}>{card.flag}</div>
              <div className="ccard-img-overlay"/>
              <div className="ccard-img-meta">
                <div className="ccard-dest">{card.dest}<br/><span style={{fontSize:11,fontWeight:400,opacity:0.8}}>{card.country}</span></div>
                <div className="ccard-votes">↑ {card.votes}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:2,height:48,overflow:"hidden"}}>
              {card.photos.map((p,j)=><div key={j} style={{flex:1,background:["var(--foam)","var(--mist)","#EEF0FA"][j],display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{p}</div>)}
            </div>
            <div className="ccard-body">
              <div className="ccard-author">
                <div className="ccard-avatar" style={{background:["#4A6FA5","#3A7D5A","#8A4F3A","#6A4F8A","#4A7A6A","#3A5A8A"][i%6]}}>{card.author}</div>
                <div className="ccard-name">by {card.name}</div>
              </div>
              <div className="ccard-meta">{card.meta}</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {card.tags.map((t,j)=><span key={j} className={`ctag ${j===0?"hi":""}`}>{t}</span>)}
              </div>
            </div>
            <div style={{padding:"10px 16px",borderTop:"1px solid var(--mist)",display:"flex",gap:8}}>
              <button style={{flex:1,padding:"8px",borderRadius:10,border:"1.5px solid var(--mist)",background:"none",fontSize:12,color:"var(--slate)",cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--terra)";e.currentTarget.style.color="var(--terra)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--mist)";e.currentTarget.style.color="var(--slate)"}}>Fork trip</button>
              <button style={{flex:1,padding:"8px",borderRadius:10,border:"none",background:"var(--ocean)",color:"#fff",fontSize:12,cursor:"pointer"}}>View →</button>
            </div>
          </div>
        ))}
      </div>
    </>}

    {feedTab==="friends"&&FRIENDS_FEED.map((f,i)=>(
      <div key={i} className="ffeed-card">
        <div className="ffeed-header">
          <div className="ffeed-avatar" style={{background:f.color}}>{f.initial}</div>
          <div>
            <div className="ffeed-user">{f.user}</div>
            <div className="ffeed-action">{f.action} <strong style={{color:"var(--ink)"}}>{f.dest}</strong></div>
          </div>
          <div style={{marginLeft:"auto",fontSize:11,color:"var(--slate)",fontFamily:"DM Mono,monospace"}}>{f.time}</div>
        </div>
        <div style={{display:"flex",gap:3,height:160,overflow:"hidden"}}>
          <div style={{flex:2,background:"var(--foam)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>{f.flag}</div>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:3}}>
            {f.photos.slice(0,2).map((p,j)=><div key={j} style={{flex:1,background:"var(--mist)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{p}</div>)}
          </div>
        </div>
        <div style={{padding:"14px 18px"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:"var(--ink)",marginBottom:3}}>{f.dest}</div>
          <div style={{fontSize:12,color:"var(--slate)",marginBottom:8}}>{f.meta}</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {f.tags.map(t=><span key={t} className="ctag">{t}</span>)}
          </div>
        </div>
        <div className="ffeed-footer">
          <button className="ffeed-btn">↑ {f.votes} upvote</button>
          <button className="ffeed-btn">💬 Comment</button>
          <button className="ffeed-btn">↗ Fork trip</button>
          <button style={{marginLeft:"auto",padding:"7px 18px",borderRadius:100,background:"var(--ocean)",color:"#fff",border:"none",fontSize:12,cursor:"pointer"}}>View itinerary →</button>
        </div>
      </div>
    ))}
  </>;
}

/* ═══════════════════════════════════════════════════════════════
   NEW TRIP BUILDER
═══════════════════════════════════════════════════════════════ */
const EMPTY_DAYS=[
  {id:0,day:"Day 01",name:"Arrival",theme:"Set the tone",date:"Jun 14"},
  {id:1,day:"Day 02",name:"Explore",theme:"Go deep",date:"Jun 15"},
  {id:2,day:"Day 03",name:"Depart",theme:"Final moments",date:"Jun 16"},
];
function NewTripBuilder() {
  const [step,setStep]=useState(0);
  const [form,setForm]=useState({dest:"",days:"3",budget:"",theme:"",travelers:""});
  const [selVibes,setSelVibes]=useState([]);
  const [days]=useState(EMPTY_DAYS);
  const [blocks,setBlocks]=useState({});
  const [exps,setExps]=useState({0:true});
  const [typePicker,setTypePicker]=useState(null);
  const [actModal,setActModal]=useState(null);
  const [editingDetails,setEditingDetails]=useState(false);
  const [draftForm,setDraftForm]=useState({...form});
  const [draftVibes,setDraftVibes]=useState([...selVibes]);
  const toggleVibe=id=>setSelVibes(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const toggleDraftVibe=id=>setDraftVibes(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const openEdit=()=>{ setDraftForm({...form}); setDraftVibes([...selVibes]); setEditingDetails(true); };
  const saveEdit=()=>{ setForm({...draftForm}); setSelVibes([...draftVibes]); setEditingDetails(false); };
  const cancelEdit=()=>setEditingDetails(false);
  const handleTypeSelect=bt=>{const d=typePicker;setTypePicker(null);if(bt.id==="activity"){setActModal(d);return;}setBlocks(p=>({...p,[d]:[...(p[d]||[]),{id:Date.now(),...bt,title:`New ${bt.label}`,detail:"Tap to add details",price:"",status:"pending"}]}));};
  const handleAddTour=(tour,actName)=>{const d=actModal;setActModal(null);setBlocks(p=>({...p,[d]:[...(p[d]||[]),{id:Date.now(),type:"activity",ico:"🏔",bg:"#EEF0FA",label:"activity",title:actName,detail:`${tour.company} · ${tour.duration} · ★${tour.rating} (${tour.reviews.toLocaleString()} reviews)`,price:`$${tour.price}`,status:"pending",cancel:tour.cancel,cancelSafe:tour.cancel.startsWith("Free")}]}));};

  if(step===0) return <>
    <div style={{marginBottom:28}}><div className="pg-eyebrow">My Itineraries · New Trip</div><div className="pg-title">Plan a new trip</div><div style={{fontSize:14,color:"var(--slate)"}}>Tell us the basics. We'll structure everything else.</div></div>
    <div className="setup-card">
      <div className="form-grid2">
        <div style={{gridColumn:"1/-1"}}><label className="form-label">Destination</label><input className="form-inp" placeholder="e.g. Cappadocia, Turkey" value={form.dest} onChange={e=>setForm(p=>({...p,dest:e.target.value}))}/></div>
        <div><label className="form-label">Number of days</label><input className="form-inp" placeholder="e.g. 5" value={form.days} onChange={e=>setForm(p=>({...p,days:e.target.value}))}/></div>
        <div><label className="form-label">Total budget ($)</label><input className="form-inp" placeholder="e.g. 2000" value={form.budget} onChange={e=>setForm(p=>({...p,budget:e.target.value}))}/></div>
        <div style={{gridColumn:"1/-1"}}>
          <label className="form-label">Total number of travelers <span style={{color:"var(--terra)",fontFamily:"normal",textTransform:"none",letterSpacing:0,fontSize:11}}>(including yourself)</span></label>
          <input className="form-inp" placeholder="e.g. 2 (you + 1 other)" value={form.travelers} onChange={e=>setForm(p=>({...p,travelers:e.target.value}))}/>
        </div>
      </div>
      <div style={{marginBottom:20}}>
        <label className="form-label">Trip vibes <span style={{color:"var(--terra)",fontFamily:"normal",textTransform:"none",letterSpacing:0,fontSize:11}}>(select all that apply)</span></label>
        <div className="vibe-grid" style={{marginTop:8}}>
          {VIBES.map(v=>(
            <div key={v.id} className={`vibe-chip ${selVibes.includes(v.id)?"on":""}`} onClick={()=>toggleVibe(v.id)}>
              <div className="chip-dot"/>{v.icon} {v.label}
            </div>
          ))}
        </div>
      </div>
      <div style={{marginBottom:28}}><label className="form-label">Trip theme / goal</label><input className="form-inp" placeholder="e.g. Celebrate anniversary, explore ancient history" value={form.theme} onChange={e=>setForm(p=>({...p,theme:e.target.value}))}/></div>
      <button onClick={()=>setStep(1)} style={{background:"var(--terra)",color:"#fff",border:"none",padding:"14px 32px",borderRadius:100,fontSize:15,fontWeight:600,cursor:"pointer"}}>Build my itinerary →</button>
    </div>
  </>;

  return <>
    {/* HEADER — view or edit mode */}
    <div style={{marginBottom:22}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
        <div className="pg-eyebrow">My Itineraries · {form.dest||"New Trip"}</div>
        <div style={{display:"flex",gap:8}}>
          {!editingDetails
            ? <button onClick={openEdit} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 16px",borderRadius:100,border:"1.5px solid var(--mist)",background:"none",fontSize:12,color:"var(--slate)",cursor:"pointer",transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--terra)";e.currentTarget.style.color="var(--terra)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--mist)";e.currentTarget.style.color="var(--slate)"}}>
                ✏ Edit details
              </button>
            : <>
                <button onClick={cancelEdit} style={{padding:"7px 16px",borderRadius:100,border:"1.5px solid var(--mist)",background:"none",fontSize:12,color:"var(--slate)",cursor:"pointer"}}>Cancel</button>
                <button onClick={saveEdit} style={{padding:"7px 18px",borderRadius:100,background:"var(--terra)",color:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer"}}>Save changes</button>
              </>
          }
          <button style={{padding:"7px 16px",borderRadius:100,border:"1.5px solid var(--mist)",background:"none",fontSize:12,color:"var(--slate)",cursor:"pointer"}}>Save draft</button>
          <button style={{padding:"7px 18px",borderRadius:100,background:"var(--ocean)",color:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer"}}>Publish ↗</button>
        </div>
      </div>

      {!editingDetails ? (
        <>
          <div className="pg-title">{form.dest||"New Trip"}</div>
          <div style={{fontSize:13,color:"var(--slate)",fontFamily:"DM Mono,monospace",marginBottom:form.theme?6:14}}>
            {form.days} days · {form.travelers||"?"} total travelers{form.budget?` · $${form.budget} budget`:""}
          </div>
          {form.theme&&<div style={{fontSize:13,color:"var(--slate)",fontStyle:"italic",marginBottom:14}}>"{form.theme}"</div>}
          <div className="vibe-grid">
            {selVibes.length>0
              ? selVibes.map(id=>{ const v=VIBES.find(x=>x.id===id); return v?(<div key={id} className="vibe-chip on"><div className="chip-dot"/>{v.icon} {v.label}</div>):null; })
              : <span style={{fontSize:13,color:"var(--slate)"}}>No vibes selected</span>
            }
          </div>
        </>
      ) : (
        <div style={{background:"#fff",borderRadius:16,border:"1.5px solid var(--terra)",padding:24,marginTop:8}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:"var(--ink)",marginBottom:16}}>Edit Trip Details</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div style={{gridColumn:"1/-1"}}>
              <label className="form-label">Destination</label>
              <input className="form-inp" value={draftForm.dest} onChange={e=>setDraftForm(p=>({...p,dest:e.target.value}))} placeholder="e.g. Cappadocia, Turkey"/>
            </div>
            <div>
              <label className="form-label">Number of days</label>
              <input className="form-inp" value={draftForm.days} onChange={e=>setDraftForm(p=>({...p,days:e.target.value}))}/>
            </div>
            <div>
              <label className="form-label">Total budget ($)</label>
              <input className="form-inp" value={draftForm.budget} onChange={e=>setDraftForm(p=>({...p,budget:e.target.value}))} placeholder="e.g. 2000"/>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label className="form-label">Total number of travelers <span style={{color:"var(--terra)",fontFamily:"normal",textTransform:"none",letterSpacing:0,fontSize:11}}>(including yourself)</span></label>
              <input className="form-inp" value={draftForm.travelers} onChange={e=>setDraftForm(p=>({...p,travelers:e.target.value}))} placeholder="e.g. 2 (you + 1 other)"/>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <label className="form-label">Trip theme / goal</label>
              <input className="form-inp" value={draftForm.theme} onChange={e=>setDraftForm(p=>({...p,theme:e.target.value}))} placeholder="e.g. Celebrate anniversary, explore ancient history"/>
            </div>
          </div>
          <div>
            <label className="form-label">Trip vibes <span style={{color:"var(--terra)",fontFamily:"normal",textTransform:"none",letterSpacing:0,fontSize:11}}>(select all that apply)</span></label>
            <div className="vibe-grid" style={{marginTop:8}}>
              {VIBES.map(v=>(
                <div key={v.id} className={`vibe-chip ${draftVibes.includes(v.id)?"on":""}`} onClick={()=>toggleDraftVibe(v.id)}>
                  <div className="chip-dot"/>{v.icon} {v.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    <div style={{background:"var(--ocean)",borderRadius:14,padding:"13px 20px",display:"flex",alignItems:"center",gap:12,marginBottom:24,border:"1px solid rgba(201,168,76,0.15)"}}>
      <span style={{fontSize:16,color:"var(--gold)"}}>✦</span>
      <div><div style={{fontSize:13,fontWeight:600,color:"#fff"}}>Trip Intelligence active for {form.dest||"your destination"}</div><div style={{fontSize:11,color:"var(--slate)"}}>Real data from 3,200+ reviews · GetYourGuide, Viator, TripAdvisor</div></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:24}}>
      <div>
        <div className="days-col">
          {days.map(day=>(
            <div key={day.id} className="iday">
              <div className="iday-hd" onClick={()=>setExps(p=>({...p,[day.id]:!p[day.id]}))}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div className="iday-badge">{day.day}</div>
                  <div><div className="iday-name">{day.name}</div><div className="iday-sub">{day.date} · {day.theme}</div></div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:11,color:"var(--terra)",fontFamily:"DM Mono,monospace"}}>{(blocks[day.id]||[]).length} items</span>
                  <span style={{color:"var(--terra)",fontSize:18}}>{exps[day.id]?"−":"+"}</span>
                </div>
              </div>
              {exps[day.id]&&<div className="iday-body">
                <PhotoStrip photos={[]}/>
                {(blocks[day.id]||[]).length===0&&<div style={{padding:14,borderRadius:12,border:"1.5px dashed var(--mist)",textAlign:"center",color:"var(--slate)",fontSize:13}}>Nothing added yet</div>}
                {(blocks[day.id]||[]).map(b=>(
                  <div key={b.id} className="block">
                    <div className="block-ico" style={{background:b.bg||"#EEF0FA"}}>{b.ico}</div>
                    <div className="block-body">
                      <div className="block-title">{b.title}</div>
                      <div className="block-detail">{b.detail}</div>
                      {b.cancel&&<div className={`block-cancel ${b.cancelSafe?"safe":""}`}>{b.cancelSafe?"✓":"⚠"} {b.cancel}</div>}
                    </div>
                    <div className="block-right">{b.price&&<div className="block-price">{b.price}</div>}<div className="pill-pending">pending</div><button className="book-link">Book →</button></div>
                  </div>
                ))}
                <button className="add-row" onClick={()=>setTypePicker(day.id)}>+ Add accommodation, activity, restaurant, or note</button>
              </div>}
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="ck-panel">
          <div className="ck-title">Smart Checklist</div>
          <div className="ck-sub">Auto-generated for your trip</div>
          {[{label:"Book flights",deadline:"ASAP"},{label:"Reserve accommodation",deadline:"Book now"},{label:"Hot air balloon — sells out fast",deadline:"3+ wks"},{label:"Travel insurance",deadline:"Before depart"}].map((item,i)=>(
            <div key={i} className="ck-row"><div className="ck-box"/><div className="ck-label">{item.label}</div><div className="ck-dead">{item.deadline}</div></div>
          ))}
        </div>
        <div className="intel-panel">
          <div className="intel-title">Trip Intelligence</div>
          <div className="intel-sub">From 3,200+ traveler reviews</div>
          {[{c:"#5BAD7A",t:"June: peak visibility for balloon rides. Cancellation rate under 10%."},{c:"#D4A843",t:"Balloon slots sell out 3–4 weeks ahead. Book before other plans."},{c:"#D46B6B",t:"Cave hotels near Göreme: thin walls — bring earplugs."}].map((ins,i)=>(
            <div key={i} className="intel-row"><div className="intel-dot" style={{background:ins.c}}/><div className="intel-text">{ins.t}</div></div>
          ))}
        </div>
      </div>
    </div>
    {typePicker!==null&&<TypePicker onSelect={handleTypeSelect} onClose={()=>setTypePicker(null)}/>}
    {actModal!==null&&<ActivityModal day={days.find(d=>d.id===actModal)?.day} dest={form.dest||"your destination"} onClose={()=>setActModal(null)} onAdd={handleAddTour}/>}
  </>;
}

/* ═══════════════════════════════════════════════════════════════
   TRIP DETAIL MODAL
═══════════════════════════════════════════════════════════════ */
const TRIP_DETAIL_DATA = {
  0: {
    title: "Salkantay Trek, Peru",
    tripTitle: "The Trek That Changed Everything",
    rank: "#1 of my life",
    meta: "Mar 2024 · 8 days · Hiking · 4 total travelers",
    vibes: ["Hiking","Adventure"],
    coverPhoto: null,
    photos: ["⛰","🦙","🌿","🌄","🏕","🌊"],
    thoughts: {
      expect: "Better than expected",
      futureSelf: "Book the altitude acclimatization day — do not skip it. And bring more socks than you think you need.",
      bestDecision: "Hiring a local guide instead of joining a group tour. He knew every shortcut and story.",
      regret: "The last-night hostel in Aguas Calientes — should have splurged on something nicer after 7 days of camping.",
      changed: ["Nothing — I'd repeat it exactly"],
    },
    fromTripcraft: false,
    itineraryDoc: null,
    blocks: [
      {ico:"✈",bg:"#FCE8E8",title:"Flight to Cusco via Lima",detail:"LAN Airlines · JFK → LIM → CUZ",price:"$890",status:"booked"},
      {ico:"🏨",bg:"#E3EEF5",title:"Belmond Palacio Nazarenas",detail:"Night 1 · Acclimatization day",price:"$220/nt",status:"booked"},
      {ico:"🥾",bg:"#EEF0FA",title:"Salkantay Trail Day 1",detail:"Mollepata → Soraypampa · 14km",price:"$0",status:"booked"},
      {ico:"🏕",bg:"#E3EEF5",title:"Camp Soraypampa",detail:"4,300m altitude · tents provided",price:"incl.",status:"booked"},
    ],
  },
  1: {
    title: "Rome & Naples, Italy",
    tripTitle: "October in Southern Italy",
    rank: "#2 overall",
    meta: "Oct 2023 · 7 days · Foodie · 2 total travelers",
    vibes: ["Foodie","Cultural","Romantic"],
    coverPhoto: null,
    photos: ["🍝","🏛","🌅","🍕","⛲","🎨"],
    thoughts: {
      expect: "Exactly what I imagined",
      futureSelf: "Naples is the real star. Spend 3 nights there minimum, not 1.",
      bestDecision: "Booking the private Pompeii early-morning tour before crowds arrived.",
      regret: "The Trastevere restaurant was overrated and overpriced — trusted a blog over locals.",
      changed: ["More downtime"],
    },
    fromTripcraft: false,
    itineraryDoc: null,
    blocks: [],
  },
  2: {
    title: "Sedona, Arizona",
    tripTitle: "Red Rock Reset",
    rank: "#3 overall",
    meta: "Jan 2024 · 4 days · Hiking · 2 total travelers",
    vibes: ["Hiking","Relaxation"],
    coverPhoto: "🌅",
    photos: ["🌅","🏜","🌵","🦅"],
    thoughts: {
      expect: "Better than expected",
      futureSelf: "Cathedral Rock at sunrise is worth the 5am alarm. Devil's Bridge is crowded by 9am — go early.",
      bestDecision: "Staying at the Enchantment Resort instead of a cheaper option.",
      regret: "Missed the stargazing tour because of cloud cover — book a backup night.",
      changed: ["Different season"],
    },
    fromTripcraft: true,
    blocks: [
      {ico:"✈",bg:"#FCE8E8",title:"Flight PHX · Drive to Sedona",detail:"2hr scenic drive via Oak Creek",price:"$280",status:"booked"},
      {ico:"🏨",bg:"#E3EEF5",title:"Enchantment Resort",detail:"4 nights · Red rock views · Spa incl.",price:"$380/nt",status:"booked"},
      {ico:"🥾",bg:"#EEF0FA",title:"Cathedral Rock Sunrise Hike",detail:"3.2mi · Depart 5am",price:"$0",status:"booked"},
      {ico:"🥾",bg:"#EEF0FA",title:"Devil's Bridge Trail",detail:"4.4mi · Iconic sandstone arch",price:"$0",status:"booked"},
    ],
  },
  3: {
    title: "Porto, Portugal",
    tripTitle: "September Lisbon Food Sprint",
    rank: "#4 overall",
    meta: "May 2023 · 5 days · Slow travel · 1 total traveler",
    vibes: ["Foodie","Solo","Relaxation"],
    coverPhoto: null,
    photos: ["🍷","🚋","🌊","🏘"],
    thoughts: {
      expect: "Exactly what I imagined",
      futureSelf: "Stay in Ribeira — walking distance to everything. Skip the Francesinha hype, get the bifanas instead.",
      bestDecision: "Taking the train to Douro Valley for a day. Best decision of the whole trip.",
      regret: "Didn't book enough evenings in advance — Porto fills up fast.",
      changed: ["Fewer activities"],
    },
    fromTripcraft: false,
    itineraryDoc: null,
    blocks: [],
  },
};

function TripDetailModal({trip, index, onClose}) {
  const data = TRIP_DETAIL_DATA[index] || {};
  const [coverPhoto, setCoverPhoto] = useState(data.coverPhoto);
  const [activeSection, setActiveSection] = useState("photos");
  const [itinDoc, setItinDoc] = useState(data.itineraryDoc);

  const photos = data.photos || [];
  const hasTripcraft = data.fromTripcraft;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:780}} onClick={e=>e.stopPropagation()}>
        {/* Header — cover photo or icon */}
        <div style={{
          height:180, background: coverPhoto
            ? `linear-gradient(rgba(7,24,37,0.3),rgba(7,24,37,0.6))`
            : "linear-gradient(135deg,var(--ocean),var(--tide))",
          display:"flex", alignItems:"flex-end", padding:"20px 28px",
          position:"relative", flexShrink:0, overflow:"hidden",
        }}>
          {/* big cover emoji if set */}
          {coverPhoto && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:80,opacity:0.35}}>{coverPhoto}</div>
          )}
          {!coverPhoto && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:80,opacity:0.15}}>{trip.icon}</div>
          )}
          {/* gold top line */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.5),transparent)"}}/>
          <div style={{position:"relative",flex:1}}>
            {data.tripTitle && (
              <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"var(--gold-lt)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>{data.rank}</div>
            )}
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:"#fff",lineHeight:1.1,marginBottom:4}}>{data.tripTitle || trip.dest}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.6)"}}>{data.meta}</div>
          </div>
          <button className="x-btn" onClick={onClose} style={{border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.7)",flexShrink:0,alignSelf:"flex-start"}}>✕</button>
        </div>

        {/* section tabs */}
        <div style={{display:"flex",borderBottom:"1px solid var(--mist)",flexShrink:0,background:"#fff"}}>
          {[{id:"photos",label:"📸 Photos"},
            {id:"thoughts",label:"💭 Thoughts"},
            {id:"itinerary",label:"📋 Itinerary"}].map(s=>(
            <button key={s.id} onClick={()=>setActiveSection(s.id)} style={{
              padding:"12px 22px",border:"none",background:"none",fontSize:13,fontWeight:500,cursor:"pointer",
              color:activeSection===s.id?"var(--terra)":"var(--slate)",
              borderBottom:`2px solid ${activeSection===s.id?"var(--terra)":"transparent"}`,
              marginBottom:-1,transition:"all 0.15s",
            }}>{s.label}</button>
          ))}
        </div>

        <div className="modal-body" style={{padding:"24px 28px"}}>

          {/* PHOTOS TAB */}
          {activeSection==="photos"&&<>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:"var(--ink)",marginBottom:6}}>Trip Photos</div>
            <div style={{fontSize:13,color:"var(--slate)",marginBottom:18}}>Click any photo to set it as the cover. The cover shows on your profile card.</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
              {photos.map((p,i)=>(
                <div key={i} onClick={()=>setCoverPhoto(coverPhoto===p?null:p)} style={{
                  height:90,borderRadius:12,background:"var(--foam)",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,
                  cursor:"pointer",position:"relative",transition:"all 0.15s",
                  border:`2px solid ${coverPhoto===p?"var(--gold)":"var(--mist)"}`,
                }}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.03)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                  {p}
                  {coverPhoto===p&&(
                    <div style={{position:"absolute",bottom:6,right:6,background:"var(--gold)",color:"#fff",fontSize:8,padding:"2px 7px",borderRadius:100,fontWeight:700,fontFamily:"DM Mono,monospace",letterSpacing:0.5}}>COVER</div>
                  )}
                </div>
              ))}
              {/* upload slot */}
              <div style={{height:90,borderRadius:12,border:"1.5px dashed var(--mist)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,cursor:"pointer",color:"var(--slate)",fontSize:11,transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--terra)";e.currentTarget.style.color="var(--terra)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--mist)";e.currentTarget.style.color="var(--slate)"}}>
                <span style={{fontSize:22}}>+</span>Add photo
              </div>
            </div>
            {coverPhoto
              ? <div style={{background:"rgba(201,168,76,0.1)",border:"1px solid rgba(201,168,76,0.25)",borderRadius:12,padding:"12px 16px",fontSize:13,color:"var(--ink)"}}>
                  ✦ <strong>{coverPhoto}</strong> is set as your cover photo. It will show on your profile card instead of the default icon.
                </div>
              : <div style={{background:"var(--foam)",borderRadius:12,padding:"12px 16px",fontSize:13,color:"var(--slate)"}}>
                  No cover selected — your trip card will show the default icon ({trip.icon}). Click any photo above to set a cover.
                </div>
            }
          </>}

          {/* THOUGHTS TAB */}
          {activeSection==="thoughts"&&<>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:"var(--ink)",marginBottom:18}}>Your Reflection</div>
            {data.thoughts ? <>
              {[
                {label:"Overall experience",val:data.thoughts.expect,icon:"💭"},
                {label:"Note to future-you",val:data.thoughts.futureSelf,icon:"📝"},
                {label:"Best decision",val:data.thoughts.bestDecision,icon:"✦"},
                {label:"Skip next time",val:data.thoughts.regret,icon:"⚠"},
              ].map((t,i)=>(
                <div key={i} style={{background:"#fff",borderRadius:14,border:"1.5px solid var(--mist)",padding:"16px 18px",marginBottom:12}}>
                  <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"var(--slate)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>{t.icon} {t.label}</div>
                  <div style={{fontSize:14,color:"var(--ink)",lineHeight:1.65,fontStyle:i>0?"italic":"normal"}}>{t.val}</div>
                </div>
              ))}
              {data.thoughts.changed?.length>0&&(
                <div style={{background:"#fff",borderRadius:14,border:"1.5px solid var(--mist)",padding:"16px 18px",marginBottom:12}}>
                  <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"var(--slate)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>🔄 What I'd change</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                    {data.thoughts.changed.map(c=>(
                      <span key={c} style={{background:"var(--foam)",border:"1px solid var(--mist)",borderRadius:100,padding:"5px 14px",fontSize:12,color:"var(--ink)"}}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </> : (
              <div style={{padding:"32px 0",textAlign:"center",color:"var(--slate)"}}>
                <div style={{fontSize:32,marginBottom:12}}>🌄</div>
                <div style={{fontSize:15,fontWeight:500,color:"var(--ink)",marginBottom:6}}>No reflection yet</div>
                <div style={{fontSize:13,marginBottom:20}}>Add your thoughts, notes, and memories from this trip.</div>
                <button style={{background:"var(--terra)",color:"#fff",border:"none",padding:"11px 24px",borderRadius:100,fontSize:13,fontWeight:600,cursor:"pointer"}}>Add reflection →</button>
              </div>
            )}
          </>}

          {/* ITINERARY TAB */}
          {activeSection==="itinerary"&&<>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:"var(--ink)",marginBottom:6}}>Itinerary</div>
            {hasTripcraft ? (
              <>
                <div style={{fontSize:13,color:"var(--slate)",marginBottom:20}}>Built on Tripcraft — full day-by-day view below.</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {data.blocks.map((b,i)=>(
                    <div key={i} className="block">
                      <div className="block-ico" style={{background:b.bg}}>{b.ico}</div>
                      <div className="block-body"><div className="block-title">{b.title}</div><div className="block-detail">{b.detail}</div></div>
                      <div className="block-right"><div className="block-price">{b.price}</div><div className="pill-booked">{b.status}</div></div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{fontSize:13,color:"var(--slate)",marginBottom:20}}>This trip wasn't planned on Tripcraft. Upload your itinerary doc to keep everything in one place.</div>
                {!itinDoc ? (
                  <div onClick={()=>setItinDoc("uploaded")} style={{border:"2px dashed var(--mist)",borderRadius:16,padding:"40px 24px",textAlign:"center",cursor:"pointer",transition:"all 0.2s",background:"#fff"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--terra)";e.currentTarget.style.background="#FEF8F5"}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--mist)";e.currentTarget.style.background="#fff"}}>
                    <div style={{fontSize:32,marginBottom:12}}>📄</div>
                    <div style={{fontSize:15,fontWeight:500,color:"var(--ink)",marginBottom:6}}>Upload your itinerary</div>
                    <div style={{fontSize:12,color:"var(--slate)",marginBottom:16}}>PDF, Word doc, or Google Docs export · any format works</div>
                    <div style={{display:"inline-block",background:"var(--ocean)",color:"#fff",padding:"10px 22px",borderRadius:100,fontSize:13,fontWeight:600}}>Choose file</div>
                  </div>
                ) : (
                  <div style={{background:"#fff",borderRadius:14,border:"1.5px solid var(--mist)",padding:"18px 20px",display:"flex",alignItems:"center",gap:14}}>
                    <div style={{width:44,height:44,borderRadius:12,background:"#E3EEF5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>📄</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:500,color:"var(--ink)",marginBottom:2}}>{trip.dest.replace(/,.*$/,"")}_itinerary.pdf</div>
                      <div style={{fontSize:11,color:"var(--slate)"}}>Uploaded · visible only to you</div>
                    </div>
                    <button onClick={()=>setItinDoc(null)} style={{background:"none",border:"1.5px solid var(--mist)",color:"var(--slate)",padding:"6px 14px",borderRadius:100,fontSize:11,cursor:"pointer"}}>Remove</button>
                  </div>
                )}
                {/* show any stored blocks even for non-tripcraft */}
                {data.blocks?.length>0&&<div style={{marginTop:18,display:"flex",flexDirection:"column",gap:10}}>
                  {data.blocks.map((b,i)=>(
                    <div key={i} className="block">
                      <div className="block-ico" style={{background:b.bg}}>{b.ico}</div>
                      <div className="block-body"><div className="block-title">{b.title}</div><div className="block-detail">{b.detail}</div></div>
                      <div className="block-right"><div className="block-price">{b.price}</div><div className="pill-booked">{b.status}</div></div>
                    </div>
                  ))}
                </div>}
              </>
            )}
          </>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════════════════════════ */
function ProfileView() {
  const [trips, setTrips] = useState(HISTORY_TRIPS);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // get cover photo from detail data if set
  const getCover = (i) => TRIP_DETAIL_DATA[i]?.coverPhoto || null;

  const handleDragStart = (e, i) => {
    setDragIdx(i);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e, i) => {
    e.preventDefault();
    setOverIdx(i);
  };
  const handleDrop = (e, i) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); setOverIdx(null); return; }
    const next = [...trips];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved);
    // re-rank
    const RANKS = ["#1 of my life","#2 overall","#3 overall","#4 overall","#5 overall","#6 overall"];
    const reranked = next.map((t,idx)=>({...t, rank: RANKS[idx] || `#${idx+1} overall`}));
    setTrips(reranked);
    setDragIdx(null);
    setOverIdx(null);
  };

  return <>
    <WorldMapBg>
      <div style={{display:"flex",alignItems:"center",gap:20}}>
        <div className="profile-avatar">A</div>
        <div>
          <div className="profile-name">Alyssa</div>
          <div style={{fontSize:12,color:"var(--slate)",marginBottom:0}}>Explorer · Member since 2024 · {PINS.length} cities visited</div>
          <div className="pstats">
            {[{n:"7",l:"Countries"},{n:"14",l:"Trips built"},{n:"3",l:"Public"},{n:"841",l:"Upvotes"}].map((s,i)=>(
              <div key={i}><div className="pstat-n">{s.n}</div><div className="pstat-l">{s.l}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div style={{fontSize:11,color:"var(--slate)",fontFamily:"DM Mono,monospace"}}>HOVER PINS TO EXPLORE</div>
    </WorldMapBg>

    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
      <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"var(--slate)",letterSpacing:2,textTransform:"uppercase"}}>Trip Archive & Rankings</div>
      <div style={{fontSize:11,color:"var(--slate)",display:"flex",alignItems:"center",gap:5}}>
        <span style={{fontSize:13}}>⠿</span> Drag to reorder
      </div>
    </div>

    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {trips.map((t,i)=>{
        const cover = getCover(i);
        const isOver = overIdx===i && dragIdx!==null && dragIdx!==i;
        return (
          <div key={t.dest}
            draggable
            onDragStart={e=>handleDragStart(e,i)}
            onDragOver={e=>handleDragOver(e,i)}
            onDragEnd={()=>{setDragIdx(null);setOverIdx(null);}}
            onDrop={e=>handleDrop(e,i)}
            style={{
              background:"#fff",borderRadius:14,
              border:`1.5px solid ${isOver?"var(--terra)":dragIdx===i?"var(--gold)":"var(--mist)"}`,
              padding:"14px 18px",display:"flex",alignItems:"center",gap:14,
              cursor:"grab",transition:"all 0.15s",
              opacity:dragIdx===i?0.5:1,
              transform:isOver?"translateY(-2px)":"none",
              boxShadow:isOver?"0 6px 20px rgba(13,43,69,0.1)":"none",
              userSelect:"none",
            }}
            onClick={()=>{ if(dragIdx===null && !selectedTrip) setSelectedTrip({trip:t,index:i}); }}
          >
            {/* drag handle */}
            <div style={{color:"var(--mist)",fontSize:18,flexShrink:0,cursor:"grab"}}>⠿</div>

            {/* cover or icon */}
            <div style={{
              width:52, height:52, borderRadius:12, flexShrink:0,
              background: cover ? "var(--ocean)" : "var(--foam)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize: cover ? 28 : 24, border:`2px solid ${cover?"var(--gold)":"var(--mist)"}`,
              position:"relative", overflow:"hidden",
            }}>
              {cover || t.icon}
              {cover&&<div style={{position:"absolute",bottom:2,right:2,width:8,height:8,borderRadius:"50%",background:"var(--gold)"}}/>}
            </div>

            {/* text */}
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:700,color:"var(--ink)",marginBottom:2}}>
                {TRIP_DETAIL_DATA[i]?.tripTitle || t.dest}
              </div>
              <div style={{fontSize:11,color:"var(--slate)"}}>{t.meta}</div>
            </div>

            {/* rank badge */}
            <div style={{
              fontFamily:"DM Mono,monospace",fontSize:11,color:i===0?"var(--gold)":"var(--terra)",
              fontWeight:500,whiteSpace:"nowrap",
              background:i===0?"rgba(201,168,76,0.1)":"rgba(196,96,58,0.08)",
              border:`1px solid ${i===0?"rgba(201,168,76,0.25)":"rgba(196,96,58,0.15)"}`,
              padding:"4px 12px",borderRadius:100,
            }}>{t.rank}</div>

            <div style={{color:"var(--mist)",fontSize:14,flexShrink:0}}>→</div>
          </div>
        );
      })}
    </div>

    {selectedTrip&&(
      <TripDetailModal
        trip={selectedTrip.trip}
        index={selectedTrip.index}
        onClose={()=>setSelectedTrip(null)}
      />
    )}
  </>;
}

/* ═══════════════════════════════════════════════════════════════
   ABOUT PAGE
═══════════════════════════════════════════════════════════════ */
function AboutPage() {
  return <>
    <div className="about-hero">
      <div className="hero-grain"/><div className="hero-glow"/>
      <div style={{position:"relative"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(201,168,76,0.12)",border:"1px solid rgba(201,168,76,0.25)",borderRadius:100,padding:"5px 14px",fontFamily:"DM Mono,monospace",fontSize:10,color:"var(--gold)",letterSpacing:2,textTransform:"uppercase",marginBottom:20}}>✦ Our Story</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:52,fontWeight:700,color:"#fff",lineHeight:1.05,marginBottom:20}}>The trip you planned<br/>is the trip you <em style={{color:"var(--terra)"}}>own.</em></div>
        <div style={{fontSize:16,color:"rgba(255,255,255,0.55)",lineHeight:1.75,maxWidth:560}}>
          Tripcraft was built for people who believe the planning is part of the adventure — and that the best trips are the ones you designed yourself.
        </div>
      </div>
    </div>

    <div className="about-pillars">
      {[
        {icon:"🔍",title:"Trust in our data",desc:"Every insight is synthesized from thousands of real traveler reviews across GetYourGuide, Viator, TripAdvisor, and travel communities. We surface patterns, not noise."},
        {icon:"✦",title:"User ownership",desc:"We don't plan your trip. We give you the structure, the research, and the tools to plan it yourself — so that when you arrive, you already feel at home."},
        {icon:"🌍",title:"Adventure, built in",desc:"From hot air balloon comparisons in Cappadocia to local pottery workshops, we help you find the moments that actually matter to you."},
      ].map((p,i)=>(
        <div key={i} className="pillar">
          <div className="pillar-icon">{p.icon}</div>
          <div className="pillar-title">{p.title}</div>
          <div className="pillar-desc">{p.desc}</div>
        </div>
      ))}
    </div>

    <div className="about-section">
      <h2>The Problem We Solve</h2>
      <p>Modern travelers face a paradox: there is more travel information available than ever before — Reddit threads, GetYourGuide reviews, blog posts, TikToks, TripAdvisor debates, comments on questions — but it is fragmented, unstructured, and exhausting to navigate.</p>
      <p>Generic AI itineraries feel impersonal. Travel agents remove the sense of ownership. And the triumphant feeling of arriving somewhere you researched and planned yourself? That gets lost entirely when someone else makes your decisions.</p>
      <p>We built Tripcraft to fix that. Not by planning trips for you — but by giving you the internet's best travel knowledge, structured into a framework you can make your own.</p>
    </div>

    <div className="about-section">
      <h2>What Makes Tripcraft Different</h2>
      <p>We are not a booking engine. We are not a travel agent. We are the <strong>decision layer</strong> that sits above them — helping you make smarter, more confident choices before you ever hit "book."</p>
      <p>Every trip on Tripcraft is yours: your filters, your research, your decisions, your plan. And every piece of insight we surface is rooted in real traveler experience — synthesized, structured, and made actionable.</p>
      <div style={{background:"var(--foam)",borderRadius:14,padding:"20px 24px",border:"1px solid var(--mist)",marginTop:16}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"var(--ink)",marginBottom:4}}>Our promise</div>
        <div style={{fontSize:15,color:"var(--slate)",lineHeight:1.7,fontStyle:"italic"}}>"We help you turn internet chaos into decision confidence — so you arrive prepared, curious, and excited."</div>
      </div>
    </div>

    <div className="about-section">
      <h2>The Full Journey</h2>
      <p>Tripcraft is built for the complete arc of travel — from the first spark of an idea to the reflection after you land back home.</p>
      {[
        {phase:"Plan",text:"Build a structured itinerary with your filters: destination, budget, total travelers, dates, trip vibes, and goals. We surface the right options based on what matters to you."},
        {phase:"Research",text:"Every activity, hotel, and tour comes with synthesized review intelligence — top complaints, best-for tags, seasonal warnings, and competitor comparisons — so you choose with confidence."},
        {phase:"Book",text:"Affiliate links to GetYourGuide, Viator, Booking.com, and more — with clear cancellation deadlines and confirmation tracking built in."},
        {phase:"Travel",text:"Your itinerary goes with you. Day-by-day structure, booking confirmations, and offline-ready planning keep you prepared on the ground."},
        {phase:"Reflect",text:"When you return, close the loop. Rank your trip, add photos, write notes to future-you, and share what you'd change. Your reflections become community intelligence."},
        {phase:"Inspire",text:"Publish your itinerary. Let other travelers fork and remix your plan. Build a public profile that shows where you've been and what you know."},
      ].map((p,i)=>(
        <div key={i} className="phase-row">
          <div className="phase-badge">{p.phase.toUpperCase()}</div>
          <div><div className="phase-title">{p.phase}</div><div className="phase-text">{p.text}</div></div>
        </div>
      ))}
    </div>

    <div className="about-section">
      <h2>Business Model</h2>
      <p>Tripcraft is free to start. You can build up to 2 itineraries, browse the community, and access base-level review intelligence at no cost.</p>
      <p>For travelers who plan more frequently or want deeper data, we offer itinerary packs and time-based planning passes — priced to match how travel actually works (in bursts, not subscriptions).</p>
      <p>We also earn affiliate commissions when you book through our platform — which means we only make money when we've genuinely helped you make a great decision. Our incentives are aligned with yours.</p>
      <p>In the future, we'll offer anonymized, aggregated travel intelligence to hotels, tour operators, and destination brands — helping them understand real traveler expectations, not star ratings.</p>
    </div>

    <div style={{textAlign:"center",padding:"40px 0 20px"}}>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:700,color:"var(--ink)",marginBottom:12}}>Ready to plan your next trip?</div>
      <button style={{background:"var(--terra)",color:"#fff",border:"none",padding:"15px 36px",borderRadius:100,fontSize:16,fontWeight:600,cursor:"pointer"}}>Start building for free →</button>
    </div>
  </>;
}

/* ═══════════════════════════════════════════════════════════════
   SIDEBAR PAST TRIPS — collapsible dropdown
═══════════════════════════════════════════════════════════════ */
const PAST_TRIPS = [
  {id:"japan",  icon:"🇯🇵", label:"Japan 2025",          status:"draft"},
  {id:"peru",   icon:"🏔",  label:"Salkantay Trek, Peru", status:"complete"},
  {id:"italy2", icon:"🇮🇹", label:"Rome & Naples",        status:"complete"},
  {id:"sedona", icon:"🏜",  label:"Sedona, Arizona",       status:"complete"},
  {id:"porto",  icon:"🇵🇹", label:"Porto, Portugal",       status:"complete"},
];

function SidebarPastTrips({onSelect}) {
  const [open, setOpen] = useState(false);
  const pastOnly = PAST_TRIPS.filter(t => t.status !== "draft");
  const drafts   = PAST_TRIPS.filter(t => t.status === "draft");

  return <>
    {/* Drafts */}
    {drafts.map(t => (
      <button key={t.id} className="sb-item" onClick={()=>onSelect(t.id)}>
        <span className="sb-icon">{t.icon}</span>
        <span style={{flex:1,textAlign:"left"}}>{t.label}</span>
        <span style={{fontSize:10,opacity:0.4,flexShrink:0}}>draft</span>
      </button>
    ))}

    {/* Past trips toggle */}
    <button
      className="sb-item"
      onClick={()=>setOpen(o=>!o)}
      style={{justifyContent:"space-between"}}
    >
      <div style={{display:"flex",alignItems:"center",gap:11}}>
        <span className="sb-icon" style={{opacity:0.5}}>🗂</span>
        <span>Past trips</span>
        <span style={{fontSize:9,background:"rgba(255,255,255,0.1)",borderRadius:100,padding:"1px 7px",color:"rgba(255,255,255,0.5)"}}>{pastOnly.length}</span>
      </div>
      <span style={{fontSize:11,color:"rgba(255,255,255,0.3)",transition:"transform 0.2s",transform:open?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
    </button>

    {open && (
      <div style={{
        marginLeft:12,
        borderLeft:"1px solid rgba(255,255,255,0.08)",
        paddingLeft:8,
        display:"flex",
        flexDirection:"column",
        gap:2,
        marginBottom:4,
      }}>
        {pastOnly.map(t => (
          <button
            key={t.id}
            className="sb-item"
            onClick={()=>onSelect(t.id)}
            style={{padding:"8px 10px"}}
          >
            <span style={{fontSize:14,width:20,textAlign:"center",flexShrink:0}}>{t.icon}</span>
            <span style={{fontSize:12,flex:1,textAlign:"left"}}>{t.label}</span>
          </button>
        ))}
      </div>
    )}
  </>;
}

/* ═══════════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [showHero,setShowHero]=useState(true);
  const [tab,setTab]=useState("sicily");

  return (
    <div style={{minHeight:"100vh"}}>
      <style>{S}</style>
      <nav className="nav">
        <div className="nav-logo" onClick={()=>setShowHero(true)} style={{cursor:"pointer"}}>trip<span>craft</span></div>
        <div className="nav-links">
          <button className={`nav-link ${tab==="discover"&&!showHero?"active":""}`} onClick={()=>{setShowHero(false);setTab("discover")}}>Discover</button>
          <button className={`nav-link ${tab==="sicily"&&!showHero?"active":""}`} onClick={()=>{setShowHero(false);setTab("sicily")}}>My Trips</button>
          <button className={`nav-link ${tab==="profile"&&!showHero?"active":""}`} onClick={()=>{setShowHero(false);setTab("profile")}}>Profile</button>
          <button className={`nav-link ${tab==="about"&&!showHero?"active":""}`} onClick={()=>{setShowHero(false);setTab("about")}}>About</button>
        </div>
        <button className="nav-cta" onClick={()=>{setShowHero(false);setTab("new")}}>+ New trip</button>
      </nav>

      {showHero?(
        <>
          <section className="hero">
            <div className="hero-grain"/><div className="hero-glow"/><div className="hero-glow2"/>
            <div style={{position:"relative"}}>
              <div className="hero-eyebrow">✦ Intelligent Itinerary Builder</div>
              <h1 className="hero-h1">Build trips<br/>you <em>own.</em><br/><span>Own every</span> decision.</h1>
              <p className="hero-p">Structured templates powered by consolidated internet wisdom. Research, plan, book, reflect — the full journey in one place.</p>
              <div className="hero-btns">
                <button className="btn-hero" onClick={()=>{setShowHero(false);setTab("new")}}>Build your trip free →</button>
                <button className="btn-ghost" onClick={()=>{setShowHero(false);setTab("discover")}}>Browse community trips</button>
              </div>
            </div>
            <div style={{position:"relative"}}>
              <div className="hero-card">
                <div className="hero-card-badge">🌿 Active · 7 days</div>
                <div className="hero-card-title">Sicily, Italy</div>
                <div className="hero-card-meta">MAY 12–19 · 2 TOTAL TRAVELERS · $3,200 BUDGET</div>
                {HERO_DAYS.map((d,i)=>(
                  <div key={i} className="hday">
                    <div className="hday-num">{d.day}</div>
                    <div style={{flex:1}}>
                      <div className="hday-title">{d.title}</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                        {d.items.map((item,j)=><span key={j} className={`hpill ${item.includes("✓")?"done":""}`}>{item}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <div className="stats-bar">
            {[{n:"12,400+",l:"Itineraries built"},{n:"84",l:"Countries covered"},{n:"3.2M+",l:"Reviews synthesized"},{n:"94%",l:"Would plan again"}].map((s,i)=>(
              <div key={i}><div className="stat-num">{s.n}</div><div className="stat-label">{s.l}</div></div>
            ))}
          </div>
        </>
      ):(
        <div className="shell">
          <aside className="sidebar">
            <div className="sb-section">My Itineraries</div>

            {/* Active */}
            <button className={`sb-item ${tab==="sicily"?"active":""}`} onClick={()=>setTab("sicily")}>
              <span className="sb-icon">◻</span>Sicily, Italy
              <span style={{marginLeft:"auto",fontSize:10,color:"var(--gold)"}}>active</span>
            </button>

            {/* Past trips collapsible */}
            <SidebarPastTrips onSelect={(tripId)=>setTab(tripId)}/>

            <div className="sb-section">Account</div>
            <button className={`sb-item ${tab==="profile"?"active":""}`} onClick={()=>setTab("profile")}>
              <span className="sb-icon">◈</span>My Profile
            </button>
          </aside>
          <div className="content">
            {tab==="sicily"   && <ExistingTrip/>}
            {tab==="discover" && <DiscoverView/>}
            {tab==="new"      && <NewTripBuilder/>}
            {tab==="profile"  && <ProfileView/>}
            {tab==="about"    && <AboutPage/>}
          </div>
        </div>
      )}
    </div>
  );
}
