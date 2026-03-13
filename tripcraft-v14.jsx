import { useState, useRef, useCallback, useEffect } from "react";

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

/* time slot sections */
.time-slot{margin-bottom:6px}
.time-slot-label{font-family:'DM Mono',monospace;font-size:9px;color:var(--slate);letter-spacing:2px;text-transform:uppercase;padding:6px 0 8px;display:flex;align-items:center;gap:8px}
.time-slot-label::after{content:'';flex:1;height:1px;background:var(--mist)}

.photo-strip{display:flex;gap:8px;margin-bottom:4px;flex-wrap:wrap}
.photo-thumb{width:72px;height:56px;border-radius:10px;border:2px solid var(--mist);display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;transition:all 0.15s;background:var(--foam)}
.photo-thumb:hover{border-color:var(--terra);transform:scale(1.04)}
.photo-add{width:72px;height:56px;border-radius:10px;border:1.5px dashed var(--mist);background:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;transition:all 0.15s;color:var(--slate);font-size:10px}
.photo-add:hover{border-color:var(--terra);color:var(--terra)}

.block{display:flex;align-items:flex-start;gap:13px;padding:13px 15px;border-radius:12px;border:1.5px solid var(--mist);background:var(--surface);transition:all 0.15s;position:relative}
.block:hover{border-color:rgba(196,96,58,0.3);background:#FBF8F6}
.block-ico{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.block-body{flex:1}
.block-title{font-size:14px;font-weight:500;color:var(--ink);margin-bottom:2px}
.block-time{font-family:'DM Mono',monospace;font-size:11px;color:var(--terra);font-weight:500;margin-bottom:3px}
.block-detail{font-size:11px;color:var(--slate);line-height:1.5}
.block-cancel{font-size:10px;color:var(--amber);font-family:'DM Mono',monospace;margin-top:3px;display:flex;align-items:center;gap:4px}
.block-cancel.safe{color:var(--green)}
.block-right{display:flex;flex-direction:column;align-items:flex-end;gap:5px}
.block-price{font-family:'DM Mono',monospace;font-size:13px;color:var(--ink);font-weight:500}
.pill-booked{background:#E3F0E8;color:var(--green);font-size:10px;padding:3px 9px;border-radius:100px;font-weight:500}
.pill-pending{background:#FEF0E6;color:var(--amber);font-size:10px;padding:3px 9px;border-radius:100px;font-weight:500}
.book-link{font-size:11px;color:var(--terra);background:none;border:none;cursor:pointer;font-weight:500;text-decoration:underline;padding:0}
.block-actions{display:flex;gap:4px;position:absolute;top:10px;right:10px;opacity:0;transition:opacity 0.15s}
.block:hover .block-actions{opacity:1}
.block-action-btn{width:26px;height:26px;border-radius:7px;border:1px solid var(--mist);background:#fff;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--slate);transition:all 0.15s}
.block-action-btn:hover{border-color:var(--terra);color:var(--terra)}
.block-action-btn.del:hover{border-color:var(--red);color:var(--red)}
.add-row{display:flex;align-items:center;gap:8px;padding:11px 15px;border-radius:12px;border:1.5px dashed var(--mist);background:none;color:var(--slate);font-size:13px;cursor:pointer;width:100%;transition:all 0.15s}
.add-row:hover{border-color:var(--terra);color:var(--terra);background:#FEF8F5}

/* tiered cancel policy */
.cancel-tier{display:flex;align-items:center;gap:8px;padding:5px 0;font-size:11px}
.cancel-tier-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}

/* right panel tabs */
.panel-tabs{display:flex;gap:0;margin-bottom:0;border:1.5px solid var(--mist);border-radius:12px;overflow:hidden;background:var(--foam)}
.ptab{padding:9px 16px;font-size:12px;font-weight:500;cursor:pointer;border:none;background:none;color:var(--slate);transition:all 0.15s;flex:1;text-align:center}
.ptab.active{background:var(--ocean);color:#fff}
.ptab:hover:not(.active){background:var(--mist);color:var(--ink)}
.panel-body{background:#fff;border-radius:0 0 16px 16px;border:1.5px solid var(--mist);border-top:none;padding:20px}

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
.ck-cat{font-family:'DM Mono',monospace;font-size:8px;color:var(--slate);background:var(--foam);padding:2px 7px;border-radius:100px;letter-spacing:1px;text-transform:uppercase;flex-shrink:0}

.budget-panel{background:#fff;border-radius:16px;border:1.5px solid var(--mist);padding:22px}
.bbar{height:6px;background:var(--mist);border-radius:10px;overflow:hidden;margin-top:4px}
.bbar-fill{height:100%;border-radius:10px}

/* smart sidebar suggestion cards */
.sugg-card{background:var(--foam);border-radius:12px;border:1.5px solid var(--mist);padding:12px;margin-bottom:8px;cursor:pointer;transition:all 0.15s;display:flex;gap:10px;align-items:flex-start}
.sugg-card:hover{border-color:var(--terra);background:#FEF8F5}
.sugg-ico{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.sugg-type{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:1px;text-transform:uppercase;padding:2px 7px;border-radius:100px;font-weight:500}
.sugg-type.hotel{background:rgba(13,43,69,0.1);color:var(--ocean)}
.sugg-type.activity{background:rgba(196,96,58,0.1);color:var(--terra)}
.sugg-type.restaurant{background:rgba(46,125,79,0.1);color:var(--green)}

.discover-tabs{display:flex;gap:6px;margin-bottom:28px;border-bottom:1px solid var(--mist)}
.dtab{padding:10px 20px;font-size:13px;font-weight:500;cursor:pointer;border:none;background:none;color:var(--slate);border-bottom:2px solid transparent;transition:all 0.15s;margin-bottom:-1px}
.dtab.active{color:var(--terra);border-bottom-color:var(--terra)}
.fchip{padding:7px 16px;border-radius:100px;border:1.5px solid var(--mist);background:#fff;font-size:12px;color:var(--ink);cursor:pointer;transition:all 0.15s}
.fchip.active{background:var(--ocean);color:#fff;border-color:var(--ocean)}
.fchip:hover:not(.active){border-color:var(--terra);color:var(--terra)}
.dmap-wrap{background:var(--deep);border-radius:20px;overflow:hidden;margin-bottom:28px;position:relative;border:1px solid rgba(201,168,76,0.15)}
.dmap-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 0}
.dmap-svg{display:block;width:100%;cursor:default}
.dmap-tooltip{position:absolute;background:rgba(7,24,37,0.96);border:1px solid rgba(201,168,76,0.25);border-radius:12px;padding:10px 14px;pointer-events:none;min-width:170px;backdrop-filter:blur(8px);box-shadow:0 8px 24px rgba(0,0,0,0.4);transition:opacity 0.15s}
.dmap-pin{cursor:pointer;transition:all 0.15s}
.dmap-pin:hover circle{filter:brightness(1.3)}
@keyframes pinPop{0%{transform:scale(0);opacity:0}70%{transform:scale(1.2)}100%{transform:scale(1);opacity:1}}
@keyframes pinPulse{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(1.8);opacity:0.1}}

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

/* autocomplete */
.autocomplete-wrap{position:relative}
.autocomplete-drop{position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border-radius:12px;border:1.5px solid var(--terra);box-shadow:0 12px 32px rgba(13,43,69,0.15);z-index:100;overflow:hidden}
.autocomplete-item{padding:11px 16px;font-size:14px;color:var(--ink);cursor:pointer;transition:background 0.1s;display:flex;align-items:center;gap:10px}
.autocomplete-item:hover{background:var(--foam)}
.autocomplete-item-icon{font-size:16px;width:24px;text-align:center;flex-shrink:0}
.autocomplete-item-sub{font-size:11px;color:var(--slate);margin-top:1px}

/* reflect */
.reflect-banner{background:linear-gradient(135deg,var(--ocean),var(--tide));border-radius:16px;padding:20px 24px;margin-bottom:24px;display:flex;align-items:center;gap:16px;border:1px solid rgba(201,168,76,0.2)}
.reflect-cta{background:rgba(201,168,76,0.2);border:1px solid rgba(201,168,76,0.4);color:var(--gold-lt);padding:9px 20px;border-radius:100px;font-size:12px;font-weight:600;cursor:pointer;flex-shrink:0;transition:all 0.15s;margin-left:auto}
.reflect-cta:hover{background:rgba(201,168,76,0.32)}

.slider-wrap{position:relative;margin:10px 0 6px}
.slider-track{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:10px;outline:none;cursor:pointer;background:linear-gradient(to right,var(--terra) 0%,var(--gold) 50%,var(--ocean) 100%)}
.slider-track::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:var(--ocean);border:3px solid var(--gold);cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2)}
.slider-labels{display:flex;justify-content:space-between;font-size:10px;color:var(--slate);margin-top:6px;font-family:'DM Mono',monospace}

.about-hero{background:linear-gradient(135deg,var(--deep),var(--ocean));border-radius:20px;padding:56px 48px;margin-bottom:32px;position:relative;overflow:hidden}
.about-hero::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent)}
.about-section{background:#fff;border-radius:16px;border:1.5px solid var(--mist);padding:32px;margin-bottom:20px}
.about-section h2{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:var(--ink);margin-bottom:12px}
.about-section p{font-size:15px;color:var(--slate);line-height:1.75;margin-bottom:12px}
.about-pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:20px}
.pillar{background:var(--foam);border-radius:14px;padding:22px;border:1px solid var(--mist);text-align:center}
.pillar-icon{font-size:28px;margin-bottom:10px}
.pillar-title{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:700;color:var(--ink);margin-bottom:6px}
.pillar-desc{font-size:12px;color:var(--slate);line-height:1.6}
.phase-row{display:flex;gap:16px;margin-bottom:12px;align-items:flex-start}
.phase-badge{background:var(--ocean);color:#fff;font-family:'DM Mono',monospace;font-size:10px;padding:4px 12px;border-radius:100px;letter-spacing:1px;white-space:nowrap;margin-top:3px;flex-shrink:0}
.phase-text{font-size:14px;color:var(--slate);line-height:1.6}
.phase-title{font-size:14px;font-weight:600;color:var(--ink);margin-bottom:2px}

.map-outer{position:relative;background:var(--ocean);border-radius:20px;overflow:hidden;margin-bottom:0;user-select:none}
.map-hint{position:absolute;bottom:12px;right:16px;background:rgba(7,24,37,0.75);backdrop-filter:blur(4px);border-radius:8px;padding:5px 12px;font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:1px;pointer-events:none}

/* ── Trip Map View ──────────────────────────────────────────── */
.tripmap-root{display:flex;flex-direction:column;gap:0;border-radius:20px;overflow:hidden;border:1.5px solid var(--mist);background:var(--deep)}
.tripmap-topbar{display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.07);flex-shrink:0;background:rgba(7,24,37,0.6)}
.tripmap-body{display:grid;grid-template-columns:1fr 320px;flex:1;min-height:0}
.tripmap-canvas{position:relative;overflow:hidden;background:linear-gradient(160deg,#b8d8e8 0%,#9dc8d8 100%);cursor:grab}
.tripmap-canvas:active{cursor:grabbing}
.tripmap-panel{background:var(--deep);display:flex;flex-direction:column;border-left:1px solid rgba(255,255,255,0.07);min-height:0}
.tripmap-panel-hd{padding:16px 16px 0;flex-shrink:0}
.tripmap-panel-title{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:#fff;margin-bottom:1px}
.tripmap-panel-sub{font-size:9px;color:var(--slate);font-family:'DM Mono',monospace;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px}
.tripmap-filter{padding:4px 10px;border-radius:100px;border:1px solid rgba(255,255,255,0.1);background:none;color:rgba(255,255,255,0.4);font-size:9px;cursor:pointer;transition:all 0.15s;font-family:'DM Mono',monospace}
.tripmap-filter.active{background:rgba(196,96,58,0.25);border-color:rgba(196,96,58,0.5);color:var(--terra-lt)}
.tripmap-places{flex:1;overflow-y:auto;padding:8px}
.tripmap-place-card{padding:9px 11px;border-radius:10px;margin-bottom:5px;cursor:pointer;transition:all 0.15s;border:1px solid transparent;display:flex;align-items:flex-start;gap:9px}
.tripmap-place-card:hover{background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.09)}
.tripmap-place-card.sel{background:rgba(196,96,58,0.14);border-color:rgba(196,96,58,0.35)}
.tripmap-legend-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}

/* selected detail drawer */
.tripmap-drawer{background:rgba(13,43,69,0.95);border-top:1px solid rgba(255,255,255,0.08);padding:0;flex-shrink:0;max-height:0;overflow:hidden;transition:max-height 0.3s ease}
.tripmap-drawer.open{max-height:340px}

/* zoom controls */
.zoom-ctrl{position:absolute;bottom:16px;left:16px;display:flex;flex-direction:column;gap:1px;z-index:10}
.zoom-btn{width:30px;height:30px;background:rgba(7,24,37,0.85);border:1px solid rgba(255,255,255,0.12);color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.15s;line-height:1}
.zoom-btn:first-child{border-radius:8px 8px 0 0}
.zoom-btn:last-child{border-radius:0 0 8px 8px}
.zoom-btn:hover{background:rgba(196,96,58,0.4)}

/* travel time pill */
.travel-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:100px;font-size:9px;font-family:'DM Mono',monospace;font-weight:600}

@keyframes mapPulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.6);opacity:0.12}}
@keyframes markerIn{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
@keyframes drawerIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* hotel compare modal */
.hotel-compare-card{background:#fff;border-radius:14px;border:1.5px solid var(--mist);padding:16px;transition:all 0.15s;cursor:pointer}
.hotel-compare-card:hover{border-color:var(--terra)}
.hotel-compare-card.selected{border-color:var(--terra);background:rgba(196,96,58,0.04)}

/* progress bar */
.progress-bar{height:4px;background:var(--mist);border-radius:10px;overflow:hidden;margin-bottom:12px}
.progress-fill{height:100%;background:linear-gradient(90deg,var(--terra),var(--gold));border-radius:10px;transition:width 0.4s}

/* ── Save from Web (Phase 1) ─────────────────────────────────── */
.save-bar{background:var(--deep);border-bottom:1px solid rgba(201,168,76,0.15);padding:0 48px;height:52px;display:flex;align-items:center;gap:12;position:sticky;top:62px;z-index:200}
.save-input-wrap{flex:1;max-width:580px;position:relative;display:flex;align-items:center;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:100px;padding:0 16px;height:36px;gap:10;transition:border-color 0.2s}
.save-input-wrap:focus-within{border-color:rgba(201,168,76,0.5);background:rgba(255,255,255,0.09)}
.save-input{background:none;border:none;outline:none;color:#fff;font-size:13px;flex:1;min-width:0}
.save-input::placeholder{color:rgba(255,255,255,0.3)}
.save-label{font-family:'DM Mono',monospace;font-size:10px;color:var(--gold);letter-spacing:1.5px;text-transform:uppercase;white-space:nowrap;flex-shrink:0}
.save-btn{background:var(--terra);color:#fff;padding:7px 18px;border-radius:100px;font-size:12px;font-weight:600;border:none;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all 0.15s}
.save-btn:hover{background:var(--terra-lt)}
.save-btn:disabled{background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.3);cursor:not-allowed}

/* preview card that appears on paste */
.link-preview{background:#fff;border-radius:16px;border:1.5px solid var(--mist);overflow:hidden;display:flex;gap:0;transition:all 0.2s;cursor:pointer;animation:slideIn 0.25s ease}
.link-preview:hover{border-color:var(--terra);box-shadow:0 8px 24px rgba(13,43,69,0.1)}
@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.link-preview-thumb{width:110px;min-height:80px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:36px;position:relative;overflow:hidden}
.link-preview-thumb-platform{position:absolute;top:6px;left:6px;background:rgba(0,0,0,0.7);border-radius:6px;padding:2px 7px;font-size:9px;font-weight:700;color:#fff;letter-spacing:0.5px;font-family:'DM Mono',monospace}
.link-preview-body{padding:14px 16px;flex:1;min-width:0}
.link-preview-platform{font-family:'DM Mono',monospace;font-size:9px;color:var(--slate);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:5px}
.link-preview-title{font-size:14px;font-weight:600;color:var(--ink);line-height:1.35;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.link-preview-creator{font-size:11px;color:var(--slate);margin-bottom:8px}
.link-preview-tags{display:flex;flex-wrap:wrap;gap:5px}
.link-preview-tag{background:var(--foam);border-radius:100px;padding:2px 9px;font-size:10px;color:var(--slate)}
.link-preview-tag.dest{background:rgba(196,96,58,0.1);color:var(--terra)}

/* saved items list in trip */
.saved-item{display:flex;gap:12px;padding:12px 14px;border-radius:12px;border:1.5px solid var(--mist);background:var(--surface);transition:all 0.15s;align-items:flex-start;position:relative}
.saved-item:hover{border-color:rgba(196,96,58,0.3);background:#FBF8F6}
.saved-item-thumb{width:48px;height:48px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;position:relative}
.saved-item-platform-dot{position:absolute;bottom:-3px;right:-3px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;border:2px solid #fff}
.saved-item-title{font-size:13px;font-weight:500;color:var(--ink);margin-bottom:2px;line-height:1.35}
.saved-item-meta{font-size:11px;color:var(--slate)}
.saved-item-action{margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0}

/* mobile share sheet mockup */
.share-sheet{background:#fff;border-radius:24px 24px 0 0;padding:0;overflow:hidden;box-shadow:0 -12px 48px rgba(0,0,0,0.18)}
.share-sheet-handle{width:36px;height:4px;border-radius:10px;background:#e0e0e0;margin:12px auto 0}
.share-sheet-content-preview{padding:16px 20px;border-bottom:1px solid #f0f0f0;display:flex;gap:12px;align-items:center}
.share-sheet-apps{display:grid;grid-template-columns:repeat(4,1fr);gap:0;padding:16px 8px}
.share-app-btn{display:flex;flex-direction:column;align-items:center;gap:7px;padding:10px 8px;border-radius:14px;cursor:pointer;transition:background 0.15s;border:none;background:none}
.share-app-btn:hover{background:#f5f5f5}
.share-app-btn.tripcraft{background:rgba(196,96,58,0.06)}
.share-app-btn.tripcraft:hover{background:rgba(196,96,58,0.12)}
.share-app-icon{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px}
.share-app-label{font-size:11px;color:#333;font-weight:500;text-align:center;line-height:1.2}
.share-app-label.tripcraft{color:var(--terra);font-weight:600}
.phone-frame{background:#1c1c1e;border-radius:48px;padding:14px;box-shadow:0 40px 80px rgba(0,0,0,0.5),inset 0 0 0 2px rgba(255,255,255,0.1);position:relative;width:280px;flex-shrink:0}
.phone-notch{width:100px;height:28px;background:#1c1c1e;border-radius:0 0 18px 18px;position:absolute;top:14px;left:50%;transform:translateX(-50%);z-index:10}
.phone-screen{border-radius:36px;overflow:hidden;background:#000;position:relative}

/* saved panel inside trip */
.saved-panel-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.saved-count-badge{background:var(--terra);color:#fff;font-family:'DM Mono',monospace;font-size:10px;padding:3px 9px;border-radius:100px;letter-spacing:0.5px}

/* ── Mobile bottom nav (hidden by default, shown on mobile) ── */
.mobile-bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;height:60px;background:var(--deep);border-top:1px solid rgba(255,255,255,0.08);z-index:250;align-items:center;justify-content:space-around;padding:0 4px;safe-area-inset-bottom:env(safe-area-inset-bottom)}
.mbn-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 12px;border:none;background:none;cursor:pointer;color:rgba(255,255,255,0.4);font-size:10px;font-family:'DM Sans',sans-serif;transition:color 0.15s;min-width:52px}
.mbn-btn.active{color:var(--terra-lt)}
.mbn-icon{font-size:18px;line-height:1.2}

/* ── Tablet (641–1024px) ────────────────────────────────────── */
@media(max-width:1024px){
  .nav{padding:0 24px}
  .hero{padding:60px 32px 72px;gap:40px}
  .hero-h1{font-size:52px}
  .stats-bar{padding:20px 32px;gap:32px}
  .shell{grid-template-columns:220px 1fr}
  .content{padding:32px 28px}
  .card-grid{grid-template-columns:repeat(2,1fr)}
  .about-pillars{grid-template-columns:repeat(2,1fr)}
  .tripmap-body{grid-template-columns:1fr 260px}
  .about-hero{padding:40px 32px}
  .setup-card{padding:28px}
}

/* ── Mobile (≤640px) ────────────────────────────────────────── */
@media(max-width:640px){
  /* nav */
  .nav{padding:0 16px;height:54px}
  .nav-links{display:none}
  .nav-cta{padding:8px 14px;font-size:12px}
  /* save bar aligns with shorter nav */
  .save-bar{top:54px;padding:0 14px;gap:8px}
  .save-label{display:none}

  /* hero */
  .hero{grid-template-columns:1fr;padding:40px 20px 52px;gap:28px}
  .hero-h1{font-size:36px}
  .hero-p{font-size:14px;max-width:100%;margin-bottom:24px}
  .hero-btns{flex-direction:column;gap:10px}
  .btn-hero,.btn-ghost{width:100%;text-align:center;padding:14px 20px;box-sizing:border-box}
  .hero-card{padding:18px}

  /* stats */
  .stats-bar{padding:16px 20px;gap:20px;flex-wrap:wrap}
  .stats-bar>div{min-width:calc(50% - 20px)}
  .stat-num{font-size:24px}

  /* shell: hide sidebar, full-width content, leave space for bottom nav */
  .shell{grid-template-columns:1fr;min-height:calc(100vh - 54px);padding-bottom:60px}
  .sidebar{display:none}
  .content{padding:20px 14px;overflow-y:auto}

  /* show mobile bottom nav */
  .mobile-bottom-nav{display:flex}

  /* page headers */
  .pg-title{font-size:26px}

  /* day cards */
  .iday-hd{padding:12px 14px}
  .iday-body{padding:12px 14px}
  .block{padding:10px 12px;gap:10px}
  .block-ico{width:30px;height:30px;font-size:13px}

  /* grids → single column */
  .card-grid{grid-template-columns:1fr}
  .about-pillars{grid-template-columns:1fr}
  .form-grid2{grid-template-columns:1fr}

  /* trip map: hide side panel, full map */
  .tripmap-body{grid-template-columns:1fr}
  .tripmap-panel{display:none}

  /* modals */
  .overlay{padding:0;align-items:flex-end}
  .modal{border-radius:20px 20px 0 0;max-width:100%;max-height:96vh}
  .modal-hd{padding:16px 20px 12px}
  .modal-body{padding:14px 20px}
  .type-box{width:100%;border-radius:20px}

  /* profile */
  .profile-map-header{height:170px}
  .profile-overlay{padding:32px 18px 18px}
  .profile-name{font-size:20px}
  .pstats{gap:18px}
  .profile-avatar{width:56px;height:56px;font-size:22px}

  /* about */
  .about-hero{padding:32px 20px}
  .about-section{padding:22px 18px}
  .setup-card{padding:22px 18px;max-width:100%}

  /* discover tabs: scrollable */
  .discover-tabs{overflow-x:auto;flex-wrap:nowrap;padding-bottom:2px;-webkit-overflow-scrolling:touch}
  .dtab{white-space:nowrap}

  /* intel panel */
  .intel-panel{padding:16px 18px}
  .ck-panel{padding:16px 18px}
  .budget-panel{padding:16px 18px}

  /* vibe chips: wrap nicely */
  .vibe-grid{gap:6px}
  .vibe-chip{font-size:12px;padding:8px 14px}

  /* photo strip */
  .photo-thumb,.photo-add{width:60px;height:48px}

  /* reflect banner */
  .reflect-banner{flex-direction:column;align-items:flex-start;gap:10px;padding:16px 18px}
  .reflect-cta{margin-left:0;align-self:flex-start}

  /* compare table: allow horizontal scroll */
  .compare-table{font-size:12px}
  .modal-body .compare-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}

  /* map outer */
  .map-outer{border-radius:14px}
  .dmap-wrap{border-radius:14px}

  /* saved items */
  .saved-item{padding:10px 12px;gap:10px}

  /* link preview */
  .link-preview-thumb{width:80px}

  /* phase rows in about */
  .phase-row{flex-direction:column;gap:6px}

  /* profile stats */
  .pstat-n{font-size:20px}
}
`;

/* ═══════════════════════════════════════════════════════════════ DATA ═════ */
const VIBES=[
  {id:"adventure",label:"Adventure",icon:"ADV"},{id:"foodie",label:"Foodie",icon:"EAT"},
  {id:"cultural",label:"Cultural",icon:"CUL"},{id:"romantic",label:"Romantic",icon:"ROM"},
  {id:"hiking",label:"Hiking",icon:"HIK"},{id:"relaxation",label:"Relaxation",icon:"SUN"},
  {id:"solo",label:"Solo",icon:"SOL"},{id:"nightlife",label:"Nightlife",icon:"NGT"},
  {id:"budget",label:"Budget",icon:"BGT"},{id:"luxury",label:"Luxury",icon:"LUX"},
];

const DEST_SUGGESTIONS=[
  {icon:"MET",name:"Tokyo, Japan",sub:"Metropolitan • Asia"},
  {icon:"CST",name:"Amalfi Coast, Italy",sub:"Coastal • Europe"},
  {icon:"DST",name:"Marrakech, Morocco",sub:"Desert • Africa"},
  {icon:"CUL",name:"Kyoto, Japan",sub:"Cultural • Asia"},
  {icon:"MTN",name:"Queenstown, New Zealand",sub:"Adventure • Pacific"},
  {icon:"URB",name:"Lisbon, Portugal",sub:"Urban • Europe"},
  {icon:"SAF",name:"Nairobi, Kenya",sub:"Safari • Africa"},
  {icon:"EAT",name:"Oaxaca, Mexico",sub:"Foodie • Americas"},
  {icon:"CUL",name:"Athens, Greece",sub:"Historical • Europe"},
  {icon:"ISL",name:"Bali, Indonesia",sub:"Island • Asia"},
];

// Sicily data with time slots + staying info
const DAYS_SICILY=[
  {day:"Day 01",name:"Arrival & Palermo",theme:"Settle in, wander the markets",date:"May 12",photos:[],stayingIn:"Palermo",
   blocks:[
    {id:1,type:"transport",ico:"AIR",bg:"#FCE8E8",title:"Flight JFK → Palermo (PMO)",detail:"Alitalia AZ 601 · Departs 9:40am · Arrives 8:25pm",price:"$680",status:"booked",cancel:null,cancelTiers:[{days:30,pct:100},{days:7,pct:50},{days:0,pct:0}],conf:"AZ-2840392",time:"09:40 AM",slot:"morning"},
    {id:2,type:"stay",ico:"HTL",bg:"#E3EEF5",title:"Massimo Hotel Palermo",detail:"Corso Vittorio Emanuele · Deluxe Double · Breakfast incl.",price:"$142/nt",status:"booked",cancelTiers:[{days:7,pct:100},{days:3,pct:50},{days:0,pct:0}],conf:"BK-7291038",time:"3:00 PM",slot:"afternoon",photo:"https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80"},
    {id:3,type:"food",ico:"EAT",bg:"#FEF0E6",title:"Mercato Ballaro street dinner",detail:"~€15pp · eat your way through the market",price:"~$18",status:"pending",cancelTiers:null,conf:null,time:"7:30 PM",slot:"evening",photo:"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80"},
  ]},
  {day:"Day 02",name:"Palermo Deep Dive",theme:"Baroque, street food, hidden churches",date:"May 13",photos:[],stayingIn:"Palermo",
   blocks:[
    {id:4,type:"activity",ico:"ACT",bg:"#EEF0FA",title:"Cappella Palatina Tour",detail:"Byzantine mosaics · Book early, queues by 10am",price:"$18",status:"booked",cancelTiers:[{days:0,pct:0}],conf:"GYG-88204",time:"9:00 AM",slot:"morning",photo:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80"},
    {id:5,type:"food",ico:"EAT",bg:"#FEF0E6",title:"Trattoria Ai Cascinari",detail:"Pasta alla norma is non-negotiable",price:"~$28",status:"pending",cancelTiers:null,conf:null,time:"1:00 PM",slot:"afternoon",photo:"https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80"},
    {id:6,type:"activity",ico:"ART",bg:"#EEF0FA",title:"Ballarò street art walk",detail:"2hr self-guided loop · Free",price:"$0",status:"booked",cancelTiers:[],conf:null,time:"4:00 PM",slot:"afternoon",photo:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80"},
  ]},
  {day:"Day 03",name:"Agrigento Day Trip",theme:"Valley of the Temples at golden hour",date:"May 14",photos:[],stayingIn:"Agrigento",
   blocks:[
    {id:7,type:"transport",ico:"BUS",bg:"#FCE8E8",title:"Train: Palermo → Agrigento",detail:"Depart 8:05am · 2hr · Trenitalia",price:"$12",status:"pending",cancelTiers:[{days:0,pct:100}],conf:null,time:"8:05 AM",slot:"morning"},
    {id:8,type:"activity",ico:"ACT",bg:"#EEF0FA",title:"Valley of the Temples",detail:"Arrive by 4pm for golden light · Book online",price:"$16",status:"booked",cancelTiers:[{days:5,pct:100},{days:2,pct:50},{days:0,pct:0}],conf:"VIA-49201",time:"4:00 PM",slot:"afternoon",photo:"https://images.unsplash.com/photo-1597655601841-214a4cfe8b2c?w=400&q=80"},
  ]},
];

const CHECKLIST_DATA=[
  {label:"Book international flights",deadline:"ASAP",done:true,cat:"Booking"},
  {label:"Reserve Hotel Massimo (3 nights)",deadline:"Book now",done:true,cat:"Booking"},
  {label:"Travel insurance",deadline:"Before depart",done:false,cat:"Admin"},
  {label:"Book Cappella Palatina tickets",deadline:"1 wk out",done:true,cat:"Activity"},
  {label:"Reserve Trattoria Ai Cascinari",deadline:"2 wks out",done:false,cat:"Food"},
  {label:"Valley of the Temples entry",deadline:"3 days out",done:false,cat:"Activity"},
  {label:"Download offline maps",deadline:"Night before",done:false,cat:"Prep"},
  {label:"Notify bank of travel dates",deadline:"1 wk out",done:false,cat:"Admin"},
  {label:"Check ferry schedule Palermo–Cefalù",deadline:"2 days out",done:false,cat:"Transport"},
];

const SMART_TODO=[
  {task:"Book international flights",cat:"Booking",priority:"high",done:false},
  {task:"Reserve accommodation for all nights",cat:"Booking",priority:"high",done:false},
  {task:"Get travel insurance",cat:"Admin",priority:"high",done:false},
  {task:"Pre-book Cappella Palatina tickets",cat:"Activity",priority:"high",done:false},
  {task:"Pre-book Valley of the Temples entry",cat:"Activity",priority:"medium",done:false},
  {task:"Make restaurant reservations for key nights",cat:"Food",priority:"medium",done:false},
  {task:"Book hot air balloon (if applicable) — sells out fast",cat:"Activity",priority:"medium",done:false},
  {task:"Notify bank of international travel",cat:"Admin",priority:"low",done:false},
  {task:"Download offline Google Maps for Sicily",cat:"Prep",priority:"low",done:false},
  {task:"Research local SIM card options",cat:"Prep",priority:"low",done:false},
  {task:"Pack adapters for Italian sockets",cat:"Prep",priority:"low",done:false},
  {task:"Learn a few basic Italian phrases",cat:"Prep",priority:"low",done:false},
];

const INSIGHTS_SICILY=[
  {c:"#5BAD7A",t:"Sicily in May avoids summer crowds. Consistent sunshine, lower hotel rates.",src:"840 reviews · TripAdvisor, GetYourGuide"},
  {c:"#D4A843",t:"Agrigento tours sell out. Book 5+ days ahead to avoid missing entry.",src:"220+ Viator reviews"},
  {c:"#D46B6B",t:"Budget €20–30/day food if eating local. Over-planning restaurants wastes spend.",src:"Reddit r/solotravel · 45 mentions"},
  {c:"#5BAD7A",t:"Street food in Palermo's Mercato Ballarò is a must — arrive after 7pm for full atmosphere.",src:"TripAdvisor, 180 reviews"},
  {c:"#D4A843",t:"Rental car essential if exploring rural areas — public transport between villages is limited.",src:"r/travel · 67 mentions"},
];

const SUGGESTED_PLACES=[
  {type:"hotel",icon:"HTL",bg:"#E3EEF5",name:"Grand Hotel et des Palmes",rating:4.7,reviews:892,note:"Historic · Central Palermo",photo:"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=300&q=80"},
  {type:"activity",icon:"BCH",bg:"#EEF0FA",name:"Mondello Beach Day",rating:4.8,reviews:1240,note:"20min from city · Top-rated",photo:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=80"},
  {type:"restaurant",icon:"EAT",bg:"#FEF0E6",name:"Osteria dei Vespri",rating:4.9,reviews:634,note:"Best pasta alla norma in Sicily",photo:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=80"},
  {type:"activity",icon:"ETN",bg:"#EEF0FA",name:"Mount Etna Tour",rating:4.8,reviews:3210,note:"Full day · Departs from Catania",photo:"https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=300&q=80"},
  {type:"hotel",icon:"HTL",bg:"#E3EEF5",name:"Verdura Resort",rating:4.9,reviews:428,note:"Coastal · Luxury · West Sicily",photo:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&q=80"},
  {type:"restaurant",icon:"EAT",bg:"#FEF0E6",name:"Bye Bye Blues",rating:4.9,reviews:712,note:"1 Michelin star · Mondello",photo:"https://images.unsplash.com/photo-1559339352-11d035aa65de?w=300&q=80"},
];

const BUDGET_ITEMS=[
  {label:"Flights",spent:680,budget:700,icon:"AIR"},
  {label:"Accommodation",spent:710,budget:800,icon:"HTL"},
  {label:"Activities",spent:180,budget:400,icon:"ACT"},
  {label:"Food & drink",spent:90,budget:600,icon:"EAT"},
  {label:"Transport",spent:24,budget:150,icon:"BUS"},
];

const COMMUNITY_CARDS=[
  {flag:"IT",dest:"Amalfi Coast",country:"Italy",meta:"7 days · 2 travelers · $2,800",tags:["Romantic","Coastal"],author:"M",name:"mara.v",votes:214,photo:"https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=500&q=80",highlight:"#4A90C8"},
  {flag:"MX",dest:"Oaxaca",country:"Mexico",meta:"5 days · 1 traveler · $900",tags:["Cultural","Budget"],author:"J",name:"j.ramos",votes:188,photo:"https://images.unsplash.com/photo-1518638150340-f706e86654de?w=500&q=80",highlight:"#D4813A"},
  {flag:"PE",dest:"Salkantay Trek",country:"Peru",meta:"8 days · 4 travelers · $1,400pp",tags:["Hiking","Adventure"],author:"A",name:"alyssa.t",votes:341,photo:"https://images.unsplash.com/photo-1526392060635-9d6019884377?w=500&q=80",highlight:"#2E7D4F"},
  {flag:"JP",dest:"Kyoto",country:"Japan",meta:"6 days · 2 travelers · $3,100",tags:["Cultural","Slow Travel"],author:"K",name:"koda.s",votes:276,photo:"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&q=80",highlight:"#C75B7A"},
  {flag:"PT",dest:"Lisbon",country:"Portugal",meta:"4 days · 3 travelers · $1,200",tags:["Budget","Foodie"],author:"P",name:"priya.n",votes:159,photo:"https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=500&q=80",highlight:"#F5A623"},
  {flag:"AR",dest:"Patagonia",country:"Argentina",meta:"12 days · 3 travelers · $2,600pp",tags:["Hiking","Wild"],author:"M",name:"marcos.g",votes:422,photo:"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=500&q=80",highlight:"#4A7A9B"},
];

const FRIENDS_FEED=[
  {user:"Sara K.",initial:"S",color:"#4A6FA5",action:"just posted photos from",dest:"Cinque Terre, Italy",time:"2h ago",meta:"5 days · 2 travelers · $1,800",tags:["Coastal","Romantic"],flag:"IT",votes:47},
  {user:"James R.",initial:"J",color:"#3A7D5A",action:"shared their itinerary for",dest:"Bali, Indonesia",time:"Yesterday",meta:"10 days · 1 traveler · $1,400",tags:["Adventure","Cultural"],flag:"ID",votes:89},
  {user:"Mia C.",initial:"M",color:"#8A4F3A",action:"completed a trip to",dest:"Morocco",time:"3 days ago",meta:"8 days · 4 travelers · $2,200",tags:["Cultural","Foodie"],flag:"MA",votes:134},
];

const HISTORY_TRIPS=[
  {icon:"PE",dest:"Salkantay Trek, Peru",meta:"Mar 2024 · 8 days · Hiking",rank:"#1 of my life"},
  {icon:"IT",dest:"Rome & Naples, Italy",meta:"Oct 2023 · 7 days · Foodie",rank:"#2 overall"},
  {icon:"AZ",dest:"Sedona, Arizona",meta:"Jan 2024 · 4 days · Hiking",rank:"#3 overall"},
  {icon:"PT",dest:"Porto, Portugal",meta:"May 2023 · 5 days · Slow travel",rank:"#4 overall"},
];

const TOUR_GROUPS={
  "Hot Air Balloon":[
    {id:1,company:"Royal Balloon",price:195,rating:4.9,reviews:4820,duration:"1.5 hrs",badge:"Best Seller",groupSize:"Max 16",pickup:true,cancel:"Free cancel <24h",tags:["Sunrise","Champagne","Small group"],snippet:"\"Worth every penny — champagne at sunrise was unforgettable\""},
    {id:2,company:"Butterfly Balloons",price:165,rating:4.7,reviews:2310,duration:"1.5 hrs",badge:"Top Rated",groupSize:"Max 20",pickup:true,cancel:"Free cancel <48h",tags:["Budget pick","Hotel pickup"],snippet:"\"Great value, larger basket but still magical\""},
    {id:3,company:"Voyager Balloons",price:220,rating:4.8,reviews:1890,duration:"2 hrs",badge:"Premium",groupSize:"Max 8",pickup:true,cancel:"Non-refundable",tags:["Private option","Gourmet brkfst"],snippet:"\"Extra hour makes a huge difference for photos\""},
  ],
  "Underground City Tour":[
    {id:5,company:"Cappadocia Tours Co.",price:55,rating:4.7,reviews:2341,duration:"Full day",badge:"Top Rated",groupSize:"Max 15",pickup:true,cancel:"Free cancel <24h",tags:["Lunch incl.","2 sites"],snippet:"\"Guide made history come alive\""},
    {id:6,company:"Middle Earth Travel",price:48,rating:4.6,reviews:1120,duration:"8 hrs",badge:null,groupSize:"Max 20",pickup:true,cancel:"Free cancel <48h",tags:["Flexible stops"],snippet:"\"Relaxed itinerary, not rushed\""},
  ],
  "Pottery Workshop":[
    {id:8,company:"Red River Ceramics",price:38,rating:4.8,reviews:987,duration:"2 hrs",badge:"Unique exp.",groupSize:"Max 10",pickup:false,cancel:"Free cancel <24h",tags:["Take-home piece","Hands-on"],snippet:"\"My pot survived the flight home\""},
  ],
};

const ACTIVITY_LIST=Object.keys(TOUR_GROUPS).map((name,i)=>({
  name,icon:["01","02","03"][i]||"●",
  category:["Adventure","Cultural","Cultural"][i]||"Other",
  topRating:Math.max(...TOUR_GROUPS[name].map(t=>t.rating)),
  totalReviews:TOUR_GROUPS[name].reduce((s,t)=>s+t.reviews,0),
  minPrice:Math.min(...TOUR_GROUPS[name].map(t=>t.price)),
  maxPrice:Math.max(...TOUR_GROUPS[name].map(t=>t.price)),
  companies:TOUR_GROUPS[name].length,
}));

const HOTELS_LIST=[
  {id:"h1",name:"Grand Hotel et des Palmes",rating:4.7,reviews:892,price:165,location:"Central Palermo",amenities:["Pool","Spa","Bar","WiFi"],badge:"Historic"},
  {id:"h2",name:"Massimo Hotel Palermo",rating:4.5,reviews:1240,price:142,location:"City Center",amenities:["Restaurant","WiFi","Parking"],badge:null},
  {id:"h3",name:"Hotel Porta Felice",rating:4.8,reviews:564,price:195,location:"Seafront · Palermo",amenities:["Rooftop bar","Pool","WiFi"],badge:"Top Rated"},
];

const HERO_DAYS=[
  {day:"Day 01",title:"Palermo Arrival",items:["✓ Flight booked","✓ Hotel set","Street dinner"]},
  {day:"Day 02",title:"Palermo Deep Dive",items:["Cappella Palatina","Ballarò walk","Lunch TBD"]},
  {day:"Day 03",title:"Agrigento",items:["Morning train","Valley of Temples","Golden hour"]},
];

const PAST_TRIPS=[
  {id:"peru",  icon:"PE", name:"Salkantay Trek, Peru",  status:"past",  dates:"Sep 2024",     note:"Reflected · 8 days"},
  {id:"italy", icon:"IT", name:"Rome & Naples",         status:"past",  dates:"Jun 2024",     note:"Reflected · 11 days"},
  {id:"sedona",icon:"HI", name:"Sedona, Arizona",        status:"draft", dates:"No dates set", note:"2 days planned"},
  {id:"bali",  icon:"ID", name:"Bali, Indonesia",        status:"draft", dates:"Thinking Nov",  note:"Just vibes so far"},
];

/* ═══════════════════════════════════════════════════════════════
   SAVE FROM WEB — DATA & COMPONENTS
═══════════════════════════════════════════════════════════════ */

// Simulated link parse results (what the backend would return)
const MOCK_PARSED_LINKS = {
  "tiktok.com": {
    platform:"TikTok", platformIcon:"TK", platformColor:"#010101",
    thumbnail:"TK", thumbnailBg:"linear-gradient(135deg,#69C9D0,#010101)",
    creator:"@besttravel.spots",
    title:"The hidden beach in Sicily nobody talks about (accessible only by boat from Cefalu)",
    tags:["Sicily","Hidden gem","Beach","Italy"],
    destTag:"Sicily, Italy",
    duration:"0:47",
    views:"2.1M",
  },
  "instagram.com": {
    platform:"Instagram", platformIcon:"IG", platformColor:"#E1306C",
    thumbnail:"IG", thumbnailBg:"linear-gradient(135deg,#833AB4,#E1306C)",
    creator:"@italy.insiders",
    title:"Street food you MUST try in Palermo — ranked by a local",
    tags:["Palermo","Street food","Sicily","Foodie"],
    destTag:"Palermo, Sicily",
    duration:null,
    views:"84K likes",
  },
  "youtube.com": {
    platform:"YouTube", platformIcon:"▶", platformColor:"#FF0000",
    thumbnail:"YT", thumbnailBg:"linear-gradient(135deg,#FF0000,#CC0000)",
    creator:"Lost in Europe",
    title:"Sicily 7-Day Itinerary — Everything we wished we knew before going",
    tags:["Sicily","Itinerary","Travel guide","7 days"],
    destTag:"Sicily, Italy",
    duration:"18:24",
    views:"341K views",
  },
  "maps.google.com": {
    platform:"Google Maps", platformIcon:"GM", platformColor:"#4285F4",
    thumbnail:"GM", thumbnailBg:"linear-gradient(135deg,#4285F4,#34A853)",
    creator:"Google Maps",
    title:"Trattoria Ai Cascinari — Palermo · 4.6★ · 1,240 reviews",
    tags:["Restaurant","Palermo","Sicilian cuisine"],
    destTag:"Palermo, Sicily",
    duration:null,
    views:"1,240 reviews",
  },
  "tripadvisor.com": {
    platform:"TripAdvisor", platformIcon:"TA", platformColor:"#34E0A1",
    thumbnail:"IG", thumbnailBg:"linear-gradient(135deg,#34E0A1,#00AA6C)",
    creator:"TripAdvisor",
    title:"Valley of the Temples — #1 of 12 things to do in Agrigento",
    tags:["Agrigento","Must-see","History","Sicily"],
    destTag:"Agrigento, Sicily",
    duration:null,
    views:"4.8★ · 8,200 reviews",
  },
};

// Pre-saved items for the Sicily trip (demo state)
const INITIAL_SAVED_ITEMS = [
  {id:"s1", ...MOCK_PARSED_LINKS["tiktok.com"], savedAt:"2 days ago", addedTo:null},
  {id:"s2", ...MOCK_PARSED_LINKS["instagram.com"], savedAt:"1 day ago", addedTo:"Day 2"},
];

const TRIPS_FOR_PICKER = [
  {id:"sicily", name:"Sicily, Italy", icon:"IT", dates:"May 12–19"},
  {id:"new",    name:"+ Start a new trip", icon:"LUX", dates:null},
];

// Detect platform from URL
function detectPlatform(url) {
  if(!url) return null;
  const u = url.toLowerCase();
  if(u.includes("tiktok.com")) return "tiktok.com";
  if(u.includes("instagram.com")) return "instagram.com";
  if(u.includes("youtube.com")||u.includes("youtu.be")) return "youtube.com";
  if(u.includes("maps.google")) return "maps.google.com";
  if(u.includes("tripadvisor")) return "tripadvisor.com";
  return null;
}

/* ── Save Bar (Phase 1 web UI) ──────────────────────────────── */
function SaveBar({onSaved}) {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTripPicker, setShowTripPicker] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const handlePaste = (val) => {
    setUrl(val);
    setSaved(false);
    const platform = detectPlatform(val);
    if(platform && val.length > 10) {
      setLoading(true);
      setPreview(null);
      setTimeout(() => {
        setPreview(MOCK_PARSED_LINKS[platform] || null);
        setLoading(false);
      }, 600);
    } else {
      setPreview(null);
      setLoading(false);
    }
  };

  const handleSave = (tripId) => {
    setSaving(true);
    setShowTripPicker(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      onSaved && onSaved({...preview, id:"s"+Date.now(), savedAt:"Just now", addedTo: tripId==="sicily"?"Sicily":null, url});
      setTimeout(() => { setUrl(""); setPreview(null); setSaved(false); setSelectedTrip(null); }, 2200);
    }, 500);
  };

  return (
    <div style={{background:"var(--deep)",borderBottom:"1px solid rgba(201,168,76,0.12)",padding:"10px 48px",display:"flex",alignItems:"center",gap:14,position:"sticky",top:62,zIndex:200}}>
      {/* Platform icons hint */}
      <div style={{display:"flex",gap:5,flexShrink:0}}>
        {["TK","IG","YT","GM"].map((ic,i)=>(
          <div key={i} style={{width:26,height:26,borderRadius:7,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{ic}</div>
        ))}
      </div>
      {/* Input */}
      <div style={{flex:1,maxWidth:560,position:"relative",display:"flex",alignItems:"center",background:"rgba(255,255,255,0.06)",border:`1px solid ${preview?"rgba(201,168,76,0.5)":url?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.1)"}`,borderRadius:100,padding:"0 16px",height:38,gap:10,transition:"all 0.2s"}}>
        <span style={{fontSize:13,color:"rgba(255,255,255,0.3)",flexShrink:0}}>{loading?"…":preview?"✓":""}</span>
        <input
          className="save-input"
          placeholder="Paste a TikTok, Instagram, YouTube, or Maps link to save it to a trip..."
          value={url}
          onChange={e=>handlePaste(e.target.value)}
          onPaste={e=>{ const v=e.clipboardData.getData("text"); setTimeout(()=>handlePaste(v),10); }}
        />
        {url && <button onClick={()=>{setUrl("");setPreview(null);setSaved(false);}} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:14,flexShrink:0,padding:0}}>×</button>}
      </div>
      {/* CTA */}
      {!saved ? (
        <button
          className="save-btn"
          disabled={!preview || saving}
          onClick={()=>preview&&setShowTripPicker(true)}
        >
          {saving ? "Saving..." : preview ? "Save to trip →" : "Save to trip"}
        </button>
      ) : (
        <div style={{display:"flex",alignItems:"center",gap:7,padding:"7px 16px",borderRadius:100,background:"rgba(46,125,79,0.2)",border:"1px solid rgba(46,125,79,0.4)",fontSize:12,color:"#7DD4A0",fontWeight:600,flexShrink:0}}>
          ✓ Saved to {selectedTrip==="sicily"?"Sicily, Italy":"your trip"}
        </div>
      )}

      {/* Trip picker dropdown */}
      {showTripPicker && (
        <div style={{position:"absolute",top:"calc(100% + 8px)",right:48,background:"#fff",borderRadius:16,border:"1.5px solid var(--mist)",boxShadow:"0 16px 48px rgba(13,43,69,0.18)",padding:12,zIndex:400,minWidth:240}}>
          <div style={{fontFamily:"DM Mono,monospace",fontSize:9,color:"var(--slate)",letterSpacing:2,textTransform:"uppercase",padding:"4px 8px 10px"}}>Save to which trip?</div>
          {TRIPS_FOR_PICKER.map(t=>(
            <button key={t.id} onClick={()=>{setSelectedTrip(t.id);handleSave(t.id);}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,border:"none",background:"none",width:"100%",cursor:"pointer",textAlign:"left",transition:"background 0.1s"}}
              onMouseEnter={e=>e.currentTarget.style.background="var(--foam)"}
              onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <span style={{fontSize:18}}>{t.icon}</span>
              <div><div style={{fontSize:13,fontWeight:500,color:"var(--ink)"}}>{t.name}</div>{t.dates&&<div style={{fontSize:10,color:"var(--slate)"}}>{t.dates}</div>}</div>
            </button>
          ))}
          <button onClick={()=>setShowTripPicker(false)} style={{position:"absolute",top:10,right:10,background:"none",border:"none",color:"var(--slate)",cursor:"pointer",fontSize:13}}>×</button>
        </div>
      )}
    </div>
  );
}

/* ── Link Preview Card ───────────────────────────────────────── */
function LinkPreviewCard({item, compact=false}) {
  if(!item) return null;
  const platformColors={"TikTok":"#010101","Instagram":"#E1306C","YouTube":"#FF0000","Google Maps":"#4285F4","TripAdvisor":"#00AA6C"};
  const col = platformColors[item.platform]||"var(--ocean)";
  if(compact) return (
    <div className="saved-item">
      <div className="saved-item-thumb" style={{background:item.thumbnailBg||"var(--foam)"}}>
        <span style={{fontSize:22}}>{item.thumbnail}</span>
        <div className="saved-item-platform-dot" style={{background:col}}><span style={{color:"#fff"}}>{item.platformIcon}</span></div>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div className="saved-item-title">{item.title}</div>
        <div className="saved-item-meta">{item.creator} · {item.views||item.duration||item.platform}</div>
        {item.addedTo&&<div style={{fontSize:10,color:"var(--green)",marginTop:3,fontFamily:"DM Mono,monospace"}}>✓ Added to {item.addedTo}</div>}
      </div>
      <div className="saved-item-action">
        <span style={{fontSize:10,color:"var(--slate)",fontFamily:"DM Mono,monospace"}}>{item.savedAt}</span>
        <div style={{display:"flex",gap:5}}>
          {!item.addedTo&&<button style={{padding:"4px 10px",borderRadius:100,background:"var(--terra)",color:"#fff",border:"none",fontSize:10,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>+ Add to day</button>}
          <button style={{padding:"4px 10px",borderRadius:100,background:"none",color:"var(--slate)",border:"1.5px solid var(--mist)",fontSize:10,cursor:"pointer",whiteSpace:"nowrap"}}>Open ↗</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="link-preview">
      <div className="link-preview-thumb" style={{background:item.thumbnailBg||"var(--foam)",width:120}}>
        <span style={{fontSize:40}}>{item.thumbnail}</span>
        <div className="link-preview-thumb-platform" style={{background:col}}>{item.platform.toUpperCase()}</div>
        {item.duration&&<div style={{position:"absolute",bottom:6,right:6,background:"rgba(0,0,0,0.75)",borderRadius:4,padding:"2px 6px",fontSize:9,color:"#fff",fontFamily:"DM Mono,monospace"}}>{item.duration}</div>}
      </div>
      <div className="link-preview-body">
        <div className="link-preview-platform">{item.creator} · {item.views}</div>
        <div className="link-preview-title">{item.title}</div>
        <div className="link-preview-tags">
          {item.destTag&&<span className="link-preview-tag dest">{item.destTag}</span>}
          {item.tags?.slice(0,3).map(t=><span key={t} className="link-preview-tag">{t}</span>)}
        </div>
      </div>
    </div>
  );
}

/* ── Save Page (full view with saved items + phase 2 mockup) ── */
function SaveView() {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedItems, setSavedItems] = useState(INITIAL_SAVED_ITEMS);
  const [showTripPicker, setShowTripPicker] = useState(false);
  const [justSaved, setJustSaved] = useState(null);
  const [phase2Tab, setPhase2Tab] = useState("ios");

  const handleInput = (val) => {
    setUrl(val); setSaved(false); setJustSaved(null);
    const platform = detectPlatform(val);
    if(platform && val.length > 10) {
      setLoading(true); setPreview(null);
      setTimeout(() => { setPreview(MOCK_PARSED_LINKS[platform]||null); setLoading(false); }, 600);
    } else { setPreview(null); setLoading(false); }
  };

  const handleSave = (tripId) => {
    setSaving(true); setShowTripPicker(false);
    setTimeout(() => {
      const newItem = {...preview, id:"s"+Date.now(), savedAt:"Just now", addedTo:tripId==="sicily"?"Sicily, Italy":null, url};
      setSavedItems(p=>[newItem,...p]);
      setJustSaved(newItem); setSaving(false); setSaved(true);
      setTimeout(()=>{setUrl("");setPreview(null);setSaved(false);},2500);
    }, 500);
  };

  return (
    <div>
      <div className="pg-eyebrow">Capture · Save from Anywhere</div>
      <div className="pg-title">Save to a trip</div>
      <div style={{fontSize:14,color:"var(--slate)",marginBottom:28}}>
        Paste any link — TikTok, Instagram, YouTube, Google Maps, TripAdvisor — and save it directly to a trip in under 5 seconds.
      </div>

      {/* ── Phase 1: URL input + live preview ── */}
      <div style={{background:"#fff",borderRadius:20,border:"1.5px solid var(--mist)",padding:28,marginBottom:24}}>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20}}>
          <div style={{background:"var(--terra)",color:"#fff",width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0}}>1</div>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:"var(--ink)"}}>Paste a link</div>
            <div style={{fontSize:12,color:"var(--slate)"}}>TikTok · Instagram · YouTube · Google Maps · TripAdvisor</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",gap:6}}>
            {["TK","IG","YT","GM","TA"].map((ic,i)=><span key={i} style={{fontSize:18}}>{ic}</span>)}
          </div>
        </div>

        {/* Big URL input */}
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}>
          <div style={{flex:1,display:"flex",alignItems:"center",background:"var(--foam)",border:`1.5px solid ${preview?"var(--terra)":loading?"var(--gold)":"var(--mist)"}`,borderRadius:14,padding:"0 16px",height:48,gap:10,transition:"all 0.25s"}}>
            <span style={{fontSize:16,color:loading?"var(--gold)":preview?"var(--terra)":"var(--slate)",transition:"all 0.2s"}}>{loading?"…":preview?"✓":"🔗"}</span>
            <input style={{flex:1,background:"none",border:"none",outline:"none",fontSize:14,color:"var(--ink)"}}
              placeholder="Paste your link here..."
              value={url}
              onChange={e=>handleInput(e.target.value)}
              onPaste={e=>{const v=e.clipboardData.getData("text");setTimeout(()=>handleInput(v),10);}}
            />
            {url&&<button onClick={()=>{setUrl("");setPreview(null);setSaved(false);}} style={{background:"none",border:"none",color:"var(--slate)",cursor:"pointer",fontSize:16}}>×</button>}
          </div>
          <button onClick={()=>preview&&!saving&&setShowTripPicker(true)} disabled={!preview||saving}
            style={{padding:"0 24px",height:48,borderRadius:14,background:preview&&!saving?"var(--terra)":"var(--mist)",color:preview&&!saving?"#fff":"var(--slate)",border:"none",fontSize:14,fontWeight:600,cursor:preview&&!saving?"pointer":"not-allowed",transition:"all 0.2s",whiteSpace:"nowrap",flexShrink:0}}>
            {saving?"Saving...":"Save to trip →"}
          </button>
        </div>

        {/* Live preview */}
        {loading && (
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px",borderRadius:12,background:"var(--foam)",border:"1.5px solid var(--mist)"}}>
            <div style={{width:80,height:64,borderRadius:10,background:"linear-gradient(90deg,var(--mist) 25%,var(--foam) 50%,var(--mist) 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.2s infinite"}}/>
            <div style={{flex:1}}><div style={{height:12,background:"var(--mist)",borderRadius:6,marginBottom:8,width:"70%"}}/><div style={{height:10,background:"var(--mist)",borderRadius:6,width:"45%"}}/></div>
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        )}
        {preview && !loading && <LinkPreviewCard item={preview}/>}

        {/* Success state */}
        {saved && (
          <div style={{marginTop:12,padding:"12px 16px",borderRadius:12,background:"rgba(46,125,79,0.08)",border:"1px solid rgba(46,125,79,0.25)",display:"flex",alignItems:"center",gap:10,animation:"slideIn 0.2s ease"}}>
            <span style={{fontSize:18}}>✓</span>
            <div style={{flex:1,fontSize:13,color:"var(--green)",fontWeight:500}}>Saved to Sicily, Italy — visible in your Saved tab</div>
            <button onClick={()=>setSaved(false)} style={{background:"none",border:"none",color:"var(--slate)",cursor:"pointer",fontSize:13}}>×</button>
          </div>
        )}

        {/* Trip picker */}
        {showTripPicker && (
          <div style={{marginTop:12,background:"var(--foam)",borderRadius:14,border:"1.5px solid var(--mist)",padding:12}}>
            <div style={{fontFamily:"DM Mono,monospace",fontSize:9,color:"var(--slate)",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Save to which trip?</div>
            {TRIPS_FOR_PICKER.map(t=>(
              <button key={t.id} onClick={()=>handleSave(t.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:12,border:"1.5px solid var(--mist)",background:"#fff",width:"100%",cursor:"pointer",textAlign:"left",marginBottom:8,transition:"all 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="var(--terra)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="var(--mist)"}>
                <span style={{fontSize:20}}>{t.icon}</span>
                <div><div style={{fontSize:14,fontWeight:500,color:"var(--ink)"}}>{t.name}</div>{t.dates&&<div style={{fontSize:11,color:"var(--slate)"}}>{t.dates}</div>}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Saved items ── */}
      {savedItems.length>0 && (
        <div style={{background:"#fff",borderRadius:20,border:"1.5px solid var(--mist)",padding:24,marginBottom:24}}>
          <div className="saved-panel-header">
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:"var(--ink)"}}>Your saved links</div>
            <span className="saved-count-badge">{savedItems.length} saved</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {savedItems.map(item=><LinkPreviewCard key={item.id} item={item} compact/>)}
          </div>
        </div>
      )}

      {/* ── Phase 2: Mobile Share Extension ── */}
      <div style={{background:"linear-gradient(135deg,var(--ocean),var(--tide))",borderRadius:20,padding:28,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent)"}}/>
        <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,borderRadius:"50%",background:"rgba(196,96,58,0.12)",pointerEvents:"none"}}/>

        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:6}}>
          <div style={{background:"rgba(201,168,76,0.2)",color:"var(--gold)",width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0}}>2</div>
          <div style={{fontSize:11,fontFamily:"DM Mono,monospace",color:"var(--gold)",letterSpacing:2,textTransform:"uppercase"}}>Coming soon</div>
        </div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:"#fff",marginBottom:6}}>Native Share Extension</div>
        <div style={{fontSize:14,color:"rgba(255,255,255,0.6)",marginBottom:24,maxWidth:480}}>
          Save from anywhere without switching apps. Tap Share in TikTok → see Tripcraft in the share sheet → pick a trip → done. Zero context switching.
        </div>

        <div style={{display:"flex",gap:24,alignItems:"flex-start",flexWrap:"wrap"}}>
          {/* Phone mockup */}
          <div style={{flexShrink:0}}>
            <div className="phone-frame">
              <div className="phone-notch"/>
              <div className="phone-screen">
                {/* TikTok-like app screen bg */}
                <div style={{background:"#010101",padding:"44px 0 0",minHeight:520,position:"relative"}}>
                  {/* fake tiktok video */}
                  <div style={{background:"linear-gradient(180deg,#1a1a2e,#16213e)",height:340,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
                    <div style={{fontSize:52,marginBottom:8,opacity:0}}></div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",textAlign:"center",padding:"0 20px",lineHeight:1.5}}>The hidden beach in Sicily nobody talks about 🇮🇹</div>
                    {/* TikTok UI chrome */}
                    <div style={{position:"absolute",bottom:12,left:12,right:44}}>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.9)",fontWeight:600,marginBottom:3}}>@besttravel.spots</div>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.6)"}}>Hidden beach Sicily  #sicily #travel</div>
                    </div>
                    <div style={{position:"absolute",right:8,bottom:12,display:"flex",flexDirection:"column",gap:14,alignItems:"center"}}>
                      {["Like","Comment","Share","More"].map((ic,i)=><div key={i} style={{fontSize:16,color:"#fff",textAlign:"center"}}>{ic}</div>)}
                    </div>
                  </div>

                  {/* iOS Share Sheet */}
                  <div className="share-sheet">
                    <div className="share-sheet-handle"/>
                    {/* Content being shared */}
                    <div className="share-sheet-content-preview">
                      <div style={{width:42,height:42,borderRadius:10,background:"linear-gradient(135deg,#69C9D0,#010101)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🌊</div>
                      <div><div style={{fontSize:12,fontWeight:600,color:"#000",lineHeight:1.3}}>The hidden beach in Sicily...</div><div style={{fontSize:11,color:"#888"}}>TikTok · @besttravel.spots</div></div>
                    </div>
                    {/* App icons */}
                    <div className="share-sheet-apps">
                      {[
                        {ic:"Msg",label:"Messages",color:"#34C759",bg:"#34C759"},
                        {ic:"Mail",label:"Mail",color:"#007AFF",bg:"#007AFF"},
                        {ic:"Notes",label:"Notes",color:"#FFCC00",bg:"#FFCC00"},
                        {ic:null,label:"Tripcraft",color:"var(--terra)",bg:null,tripcraft:true},
                        {ic:"Pin",label:"Pinterest",color:"#E60023",bg:"#E60023"},
                        {ic:"◻",label:"Notion",color:"#000",bg:"#fff"},
                        {ic:"Drop",label:"AirDrop",color:"#007AFF",bg:"#007AFF"},
                        {ic:"⋯",label:"More",color:"#8E8E93",bg:"#8E8E93"},
                      ].map((app,i)=>(
                        <button key={i} className={`share-app-btn ${app.tripcraft?"tripcraft":""}`}>
                          <div className="share-app-icon" style={{background:app.tripcraft?"var(--deep)":app.bg,border:app.tripcraft?"2px solid rgba(196,96,58,0.5)":"none"}}>
                            {app.tripcraft
                              ? <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:900,color:"var(--foam)"}}>tc</span>
                              : <span style={{color:app.ic==="◻"?"#000":"#fff",fontSize:app.bg==="#FFCC00"?"#000":"#fff"}}>{app.ic}</span>
                            }
                          </div>
                          <span className={`share-app-label ${app.tripcraft?"tripcraft":""}`}>{app.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{textAlign:"center",marginTop:12,fontSize:11,color:"rgba(255,255,255,0.4)",fontFamily:"DM Mono,monospace",letterSpacing:1}}>iOS SHARE SHEET</div>
          </div>

          {/* Steps */}
          <div style={{flex:1,minWidth:220}}>
            <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"rgba(255,255,255,0.5)",letterSpacing:2,textTransform:"uppercase",marginBottom:16}}>The flow</div>
            {[
              {n:"01",title:"User watches TikTok",desc:"Sees a hidden beach in Sicily. Wants to remember it."},
              {n:"02",title:"Taps Share",desc:"Native iOS/Android share sheet opens — same flow as sending to a friend."},
              {n:"03",title:"Sees Tripcraft",desc:"Your app icon appears in the share sheet alongside Messages and Notes."},
              {n:"04",title:"Picks a trip",desc:"\"Add to Sicily trip\" — one tap, done. Back to TikTok in under 3 seconds."},
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:14,marginBottom:18,alignItems:"flex-start"}}>
                <div style={{fontFamily:"DM Mono,monospace",fontSize:11,color:"var(--gold)",fontWeight:600,minWidth:24,flexShrink:0}}>{s.n}</div>
                <div><div style={{fontSize:13,fontWeight:600,color:"#fff",marginBottom:2}}>{s.title}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.55)",lineHeight:1.6}}>{s.desc}</div></div>
              </div>
            ))}
            <div style={{marginTop:8,padding:"12px 16px",borderRadius:12,background:"rgba(201,168,76,0.1)",border:"1px solid rgba(201,168,76,0.25)"}}>
              <div style={{fontSize:12,color:"var(--gold-lt)",fontWeight:600,marginBottom:4}}>How Pinterest, Notion & Apple Notes do it</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",lineHeight:1.7}}>Register app as a share target in iOS Info.plist / Android Manifest. Handle the incoming URL in your app delegate. Present the trip picker. Same tech — proven UX pattern.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ CANCEL POLICY DISPLAY ═════════════════════════════ */
function CancelTiers({tiers}) {
  if(!tiers||tiers.length===0) return null;
  const icons={100:"✓",50:"!",0:"✕"};
  const labels={100:"Full refund",50:"50% refund",0:"No refund"};
  return (
    <div style={{marginTop:6}}>
      {tiers.map((t,i)=>(
        <div key={i} className="cancel-tier">
          <span>{icons[t.pct]||"!"}</span>
          <span style={{fontSize:10,color:t.pct===100?"var(--green)":t.pct>0?"var(--amber)":"var(--red)",fontFamily:"DM Mono,monospace"}}>
            {labels[t.pct]||`${t.pct}% refund`} {t.days>0?`if cancel ${t.days}+ days before`:"within deadline"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════ DESTINATION AUTOCOMPLETE ══════════════════════════ */
function DestinationInput({value, onChange, placeholder="e.g. Sicily, Italy"}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value||"");
  const filtered = query.length>0 ? DEST_SUGGESTIONS.filter(d=>d.name.toLowerCase().includes(query.toLowerCase())).slice(0,6) : DEST_SUGGESTIONS.slice(0,5);
  
  return (
    <div className="autocomplete-wrap">
      <input className="form-inp" value={query} placeholder={placeholder}
        onChange={e=>{setQuery(e.target.value);onChange(e.target.value);setOpen(true)}}
        onFocus={()=>setOpen(true)}
        onBlur={()=>setTimeout(()=>setOpen(false),150)}
      />
      {open && filtered.length>0 && (
        <div className="autocomplete-drop">
          {filtered.map(d=>(
            <div key={d.name} className="autocomplete-item" onMouseDown={()=>{setQuery(d.name);onChange(d.name);setOpen(false);}}>
              <span className="autocomplete-item-icon">{d.icon}</span>
              <div><div style={{fontSize:14,color:"var(--ink)",fontWeight:500}}>{d.name}</div><div className="autocomplete-item-sub">{d.sub}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════ BLOCK (with edit, delete, time) ═══════════════════ */
function Block({block, onEdit, onDelete, travelers=2}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({...block});
  const [participants, setParticipants] = useState(travelers);

  if(editing) return (
    <div style={{background:"#fff",borderRadius:12,border:"1.5px solid var(--terra)",padding:16}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div style={{gridColumn:"1/-1"}}><label className="form-label">Title</label><input className="form-inp" value={draft.title} onChange={e=>setDraft(p=>({...p,title:e.target.value}))}/></div>
        <div><label className="form-label">Time</label><input className="form-inp" value={draft.time||""} onChange={e=>setDraft(p=>({...p,time:e.target.value}))} placeholder="e.g. 9:00 AM"/></div>
        <div>
          <label className="form-label">Time of day</label>
          <select className="form-inp" value={draft.slot||"morning"} onChange={e=>setDraft(p=>({...p,slot:e.target.value}))}>
            <option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option><option value="unscheduled">Unscheduled</option>
          </select>
        </div>
        <div><label className="form-label">Detail</label><input className="form-inp" value={draft.detail} onChange={e=>setDraft(p=>({...p,detail:e.target.value}))}/></div>
        <div><label className="form-label">Price</label><input className="form-inp" value={draft.price} onChange={e=>setDraft(p=>({...p,price:e.target.value}))}/></div>
        <div>
          <label className="form-label">Status</label>
          <select className="form-inp" value={draft.status} onChange={e=>setDraft(p=>({...p,status:e.target.value}))}>
            <option value="pending">Pending</option><option value="booked">Booked</option>
          </select>
        </div>
        {draft.status==="booked" && <div><label className="form-label">Confirmation #</label><input className="form-inp" value={draft.conf||""} onChange={e=>setDraft(p=>({...p,conf:e.target.value}))} placeholder="e.g. BK-1234"/></div>}
        <div>
          <label className="form-label">Participants <span style={{color:"var(--terra)",fontFamily:"normal",textTransform:"none",letterSpacing:0,fontSize:11}}>(of {travelers})</span></label>
          <input className="form-inp" type="number" min={1} max={travelers} value={participants} onChange={e=>setParticipants(+e.target.value)}/>
        </div>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={()=>setEditing(false)} style={{padding:"7px 16px",borderRadius:100,border:"1.5px solid var(--mist)",background:"none",fontSize:12,color:"var(--slate)",cursor:"pointer"}}>Cancel</button>
        <button onClick={()=>{onEdit({...draft});setEditing(false);}} style={{padding:"7px 18px",borderRadius:100,background:"var(--terra)",color:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer"}}>Save block</button>
      </div>
    </div>
  );

  return (
    <div className="block">
      <div className="block-actions">
        <button className="block-action-btn" onClick={()=>setEditing(true)} title="Edit">Edit</button>
        <button className="block-action-btn del" onClick={()=>onDelete(block.id)} title="Delete">Del</button>
      </div>
      {/* Photo thumbnail or type icon */}
      {block.photo ? (
        <div style={{width:52,height:52,borderRadius:10,flexShrink:0,overflow:"hidden"}}>
          <img src={block.photo} alt={block.title} style={{width:"100%",height:"100%",objectFit:"cover"}}
            onError={e=>{e.target.style.display="none";e.target.parentNode.style.background=block.bg;}}/>
        </div>
      ) : (
        <div className="block-ico" style={{background:block.bg,fontSize:9,fontWeight:700,letterSpacing:0.5,color:
          block.type==="activity"?"#5866B4":block.type==="transport"?"#C04040":block.type==="food"?"#7B5EA7":block.type==="stay"?"#2B6FA1":"#5B7A8E"
        }}>{block.ico}</div>
      )}
      <div className="block-body">
        {block.time && <div className="block-time">{block.time}</div>}
        <div className="block-title">{block.title}</div>
        <div className="block-detail">{block.detail}</div>
        {block.status==="booked" && block.conf && <div style={{fontSize:10,color:"var(--ocean)",fontFamily:"DM Mono,monospace",marginTop:3}}>CONF #{block.conf}</div>}
        {block.cancelTiers && block.cancelTiers.length>0 && <CancelTiers tiers={block.cancelTiers}/>}
        {travelers>1 && <div style={{fontSize:10,color:"var(--slate)",marginTop:3,fontFamily:"DM Mono,monospace"}}>{participants||travelers}/{travelers} travelers</div>}
      </div>
      <div className="block-right">
        <div className="block-price">{block.price}</div>
        <div className={block.status==="booked"?"pill-booked":"pill-pending"}>{block.status}</div>
        {block.status==="pending"&&<button className="book-link">Book →</button>}
      </div>
    </div>
  );
}

/* ═══════════ TIME SLOT GROUP ═══════════════════════════════════ */
function TimeSlotGroup({slot, label, blocks, onEdit, onDelete, travelers}) {
  if(blocks.length===0) return null;
  return (
    <div className="time-slot">
      <div className="time-slot-label">{label}</div>
      {blocks.map(b=><Block key={b.id} block={b} onEdit={onEdit} onDelete={onDelete} travelers={travelers}/>)}
    </div>
  );
}

/* ═══════════ SMART PANELS (tabs) ═══════════════════════════════ */
function SmartPanels({dest="Sicily, Italy", travelers=2, budget=3200}) {
  const [tab,setTab]=useState("todo");
  const [todos,setTodos]=useState(SMART_TODO.map((t,i)=>({...t,id:i})));

  const donePct = Math.round(todos.filter(t=>t.done).length/todos.length*100);
  const catColors={"Booking":"var(--terra)","Admin":"var(--ocean)","Activity":"var(--gold)","Food":"var(--green)","Prep":"var(--slate)","Transport":"var(--amber)"};

  const totalSpent=BUDGET_ITEMS.reduce((s,b)=>s+b.spent,0);
  const totalBudget=BUDGET_ITEMS.reduce((s,b)=>s+b.budget,0);

  return (
    <div style={{position:"sticky",top:14}}>
      {/* Suggestions sidebar */}
      <div style={{marginBottom:16}}>
        <div style={{fontFamily:"DM Mono,monospace",fontSize:9,color:"var(--slate)",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Suggested for {dest.split(",")[0]}</div>
        {SUGGESTED_PLACES.slice(0,4).map((s,i)=>(
          <div key={i} className="sugg-card">
            {s.photo ? (
              <div style={{width:40,height:40,borderRadius:8,overflow:"hidden",flexShrink:0}}>
                <img src={s.photo} alt={s.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </div>
            ) : (
              <div className="sugg-ico" style={{background:s.bg,fontSize:9,fontWeight:700,color:"var(--slate)",letterSpacing:0.5}}>{s.icon}</div>
            )}
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:500,color:"var(--ink)",marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>
              <div style={{fontSize:10,color:"var(--slate)"}}>{s.note}</div>
              <div style={{display:"flex",gap:6,marginTop:4,alignItems:"center"}}>
                <span className={`sugg-type ${s.type}`}>{s.type}</span>
                <span style={{fontSize:10,color:"var(--gold)"}}>★ {s.rating}</span>
              </div>
            </div>
            <button style={{flexShrink:0,background:"none",border:"1.5px solid var(--mist)",borderRadius:8,padding:"4px 8px",fontSize:11,color:"var(--slate)",cursor:"pointer",transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--terra)";e.currentTarget.style.color="var(--terra)"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--mist)";e.currentTarget.style.color="var(--slate)"}}>
              + Add
            </button>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{borderRadius:"12px 12px 0 0",overflow:"hidden",border:"1.5px solid var(--mist)",borderBottom:"none"}}>
        <div className="panel-tabs">
          {[["todo","To Do"],["budget","$ Budget"],["research","Research"]].map(([k,l])=>(
            <button key={k} className={`ptab ${tab===k?"active":""}`} onClick={()=>setTab(k)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="panel-body">
        {tab==="todo" && <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:700,color:"var(--ink)"}}>Smart To Do</div>
            <span style={{fontFamily:"DM Mono,monospace",fontSize:10,color:donePct===100?"var(--green)":"var(--terra)"}}>{donePct}% done</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{width:`${donePct}%`}}/></div>
          {["high","medium","low"].map(priority=>{
            const items=todos.filter(t=>t.priority===priority);
            if(items.length===0) return null;
            const priorityLabel={high:"Must do",medium:"Should do",low:"Nice to do"}[priority];
            return <div key={priority} style={{marginBottom:12}}>
              <div style={{fontFamily:"DM Mono,monospace",fontSize:9,color:"var(--slate)",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>{priorityLabel}</div>
              {items.map(item=>(
                <div key={item.id} className="ck-row">
                  <div className={`ck-box ${item.done?"done":""}`} onClick={()=>setTodos(p=>p.map(t=>t.id===item.id?{...t,done:!t.done}:t))}>{item.done&&"✓"}</div>
                  <div className={`ck-label ${item.done?"done":""}`}>{item.task}</div>
                  <span className="ck-cat" style={{color:catColors[item.cat]||"var(--slate)"}}>{item.cat}</span>
                </div>
              ))}
            </div>;
          })}
        </>}

        {tab==="budget" && <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:700,color:"var(--ink)"}}>Budget Tracker</div>
            <div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"var(--slate)"}}>{travelers} traveler{travelers>1?"s":""}</div>
          </div>
          <div style={{background:"var(--foam)",borderRadius:10,padding:12,marginBottom:14,display:"flex",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:11,color:"var(--slate)"}}>Spent</div>
              <div style={{fontFamily:"DM Mono,monospace",fontSize:18,fontWeight:500,color:"var(--ink)"}}>${totalSpent.toLocaleString()}</div>
              {travelers>1&&<div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"var(--slate)",marginTop:2}}>${Math.round(totalSpent/travelers).toLocaleString()} / person</div>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:"var(--slate)"}}>Budget</div>
              <div style={{fontFamily:"DM Mono,monospace",fontSize:18,fontWeight:500,color:"var(--ocean)"}}>${totalBudget.toLocaleString()}</div>
              {travelers>1&&<div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"var(--slate)",marginTop:2}}>${Math.round(totalBudget/travelers).toLocaleString()} / person</div>}
            </div>
          </div>
          {BUDGET_ITEMS.map((b,i)=>{
            const over=b.spent>b.budget;
            return <div key={i} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                <span style={{color:"var(--ink)",display:"flex",gap:6,alignItems:"center"}}><span>{b.icon}</span>{b.label}</span>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"DM Mono,monospace",color:over?"var(--red)":"var(--slate)",fontSize:11}}>${b.spent} / ${b.budget}</div>
                  {travelers>1&&<div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"var(--slate)"}}>${Math.round(b.spent/travelers)} pp</div>}
                </div>
              </div>
              <div className="bbar"><div className="bbar-fill" style={{width:`${Math.min((b.spent/b.budget)*100,100)}%`,background:over?"var(--red)":"var(--terra)"}}/></div>
            </div>;
          })}
          <div style={{marginTop:14,padding:"10px 14px",borderRadius:10,background:"rgba(201,168,76,0.08)",border:"1px solid rgba(201,168,76,0.2)",fontSize:12,color:"var(--slate)",display:"flex",justifyContent:"space-between"}}>
            <span>${(totalBudget-totalSpent).toLocaleString()} remaining</span>
            {travelers>1&&<span style={{fontFamily:"DM Mono,monospace",fontSize:11}}>${Math.round((totalBudget-totalSpent)/travelers).toLocaleString()} / pp</span>}
          </div>
        </>}

        {tab==="research" && <>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:700,color:"var(--ink)",marginBottom:4}}>Trip Intelligence</div>
          <div style={{fontSize:11,color:"var(--slate)",marginBottom:14}}>From 1,060+ synthesized reviews</div>
          {INSIGHTS_SICILY.map((ins,i)=>(
            <div key={i} className="intel-row" style={{borderBottom:`1px solid var(--mist)`}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:ins.c,marginTop:5,flexShrink:0}}/>
              <div><div style={{fontSize:12,color:"var(--ink)",lineHeight:1.65}}>{ins.t}</div><div style={{fontFamily:"DM Mono,monospace",fontSize:9,color:"var(--slate)",marginTop:3}}>{ins.src}</div></div>
            </div>
          ))}
          <div style={{marginTop:14,padding:12,background:"var(--foam)",borderRadius:10,fontSize:12,color:"var(--slate)",fontStyle:"italic"}}>
            Connect Anthropic API to enable AI-synthesized insights from real traveler reviews
          </div>
        </>}
      </div>
    </div>
  );
}

/* ═══════════ COMPARE MODAL ══════════════════════════════════════ */
function CompareModal({actName,tours,onClose,onAdd}) {
  const [picked,setPicked]=useState(null);
  const bestP=Math.min(...tours.map(t=>t.price));
  const bestR=Math.max(...tours.map(t=>t.rating));
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <div><div className="modal-title">Compare: {actName}</div><div className="modal-sub">{tours.length} companies · GetYourGuide & Viator · prices per person</div></div>
          <button className="x-btn" onClick={onClose}>×</button>
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

/* ═══════════ HOTEL COMPARE MODAL ════════════════════════════════ */
function HotelCompareModal({onClose,onAdd}) {
  const [picked,setPicked]=useState(null);
  const best=HOTELS_LIST.find(h=>h.rating===Math.max(...HOTELS_LIST.map(x=>x.rating)));
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:680}}>
        <div className="modal-hd">
          <div><div className="modal-title">Compare Hotels</div><div className="modal-sub">Palermo · powered by Google Places · sorted by rating</div></div>
          <button className="x-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {HOTELS_LIST.map(h=>(
            <div key={h.id} className="hotel-compare-card" style={{marginBottom:10,border:`1.5px solid ${picked===h.id?"var(--terra)":h.id===best.id?"rgba(201,168,76,0.4)":"var(--mist)"}`}}
              onClick={()=>setPicked(h.id)}>
              <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                <div style={{width:48,height:48,borderRadius:12,background:"#E3EEF5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🏨</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:700,color:"var(--ink)"}}>{h.name}</div>
                    {h.badge&&<span style={{fontSize:9,padding:"2px 8px",borderRadius:100,background:"var(--terra)",color:"#fff",fontWeight:600,textTransform:"uppercase"}}>{h.badge}</span>}
                    {h.id===best.id&&!h.badge&&<span style={{fontSize:9,padding:"2px 8px",borderRadius:100,background:"var(--green)",color:"#fff",fontWeight:600,textTransform:"uppercase"}}>Top Rated</span>}
                  </div>
                  <div style={{fontSize:12,color:"var(--slate)",marginBottom:6}}>{h.location}</div>
                  <div style={{display:"flex",gap:14,fontSize:12}}>
                    <span style={{color:"var(--gold)",fontWeight:600}}>★ {h.rating}</span>
                    <span style={{color:"var(--slate)"}}>{h.reviews.toLocaleString()} reviews</span>
                    <span style={{fontFamily:"DM Mono,monospace",color:"var(--terra)",fontWeight:500}}>${h.price}/night</span>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
                    {h.amenities.map(a=><span key={a} style={{background:"var(--foam)",borderRadius:100,padding:"3px 10px",fontSize:10,color:"var(--slate)"}}>✓ {a}</span>)}
                  </div>
                </div>
                <div style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${picked===h.id?"var(--terra)":"var(--mist)"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:4}}>
                  {picked===h.id&&<div style={{width:10,height:10,borderRadius:"50%",background:"var(--terra)"}}/>}
                </div>
              </div>
            </div>
          ))}
          {picked&&(
            <button onClick={()=>{const h=HOTELS_LIST.find(x=>x.id===picked);onAdd(h);onClose();}} style={{background:"var(--terra)",color:"#fff",border:"none",padding:"12px 28px",borderRadius:100,fontSize:13,fontWeight:600,cursor:"pointer",marginTop:8,width:"100%"}}>
              Add {HOTELS_LIST.find(h=>h.id===picked)?.name} to itinerary →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════ ACTIVITY MODAL ═════════════════════════════════════ */
function ActivityModal({day,dest,onClose,onAdd}) {
  const [comparing,setComparing]=useState(null);
  const [filter,setFilter]=useState("All");
  const [manualMode,setManualMode]=useState(false);
  const [manualName,setManualName]=useState("");

  if(comparing) return <CompareModal actName={comparing} tours={TOUR_GROUPS[comparing]} onClose={()=>setComparing(null)} onAdd={(tour,an)=>onAdd(tour,an)}/>;

  const filtered=filter==="All"?ACTIVITY_LIST:ACTIVITY_LIST.filter(a=>a.category===filter);

  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <div>
            <div className="modal-title">Add Activity</div>
            <div className="modal-sub">{day} · {dest} · real data from GetYourGuide & Viator</div>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button onClick={()=>setManualMode(false)} style={{padding:"6px 14px",borderRadius:100,border:"none",fontSize:12,fontWeight:500,cursor:"pointer",background:!manualMode?"var(--ocean)":"var(--mist)",color:!manualMode?"#fff":"var(--slate)"}}>Browse options</button>
              <button onClick={()=>setManualMode(true)} style={{padding:"6px 14px",borderRadius:100,border:"none",fontSize:12,fontWeight:500,cursor:"pointer",background:manualMode?"var(--ocean)":"var(--mist)",color:manualMode?"#fff":"var(--slate)"}}>Type manually</button>
              {!manualMode&&["All","Adventure","Cultural"].map(c=><button key={c} onClick={()=>setFilter(c)} style={{padding:"6px 14px",borderRadius:100,border:"none",fontSize:12,fontWeight:500,cursor:"pointer",background:filter===c&&!manualMode?"var(--terra)":"var(--foam)",color:filter===c&&!manualMode?"#fff":"var(--slate)"}}>{c}</button>)}
            </div>
          </div>
          <button className="x-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {manualMode ? (
            <div style={{padding:"8px 0"}}>
              <label className="form-label">Activity name</label>
              <input className="form-inp" placeholder="e.g. Sunrise hike to Mount Etna" value={manualName} onChange={e=>setManualName(e.target.value)} style={{marginBottom:16}}/>
              <button onClick={()=>{if(manualName)onAdd({company:"Manual",price:0,rating:0,reviews:0,duration:"TBD",badge:null,groupSize:"",pickup:false,cancel:"N/A",tags:[]},manualName);}} disabled={!manualName}
                style={{background:manualName?"var(--terra)":"var(--mist)",color:manualName?"#fff":"var(--slate)",border:"none",padding:"11px 28px",borderRadius:100,fontSize:13,fontWeight:600,cursor:manualName?"pointer":"not-allowed"}}>
                Add to itinerary →
              </button>
            </div>
          ) : (
            filtered.map(act=>(
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════ TYPE PICKER ════════════════════════════════════════ */
const BLOCK_TYPES=[
  {id:"stay",ico:"HTL",label:"Accommodation",bg:"#E3EEF5"},
  {id:"activity",ico:"ACT",label:"Activity / Tour",bg:"#EEF0FA"},
  {id:"food",ico:"EAT",label:"Restaurant",bg:"#FEF0E6"},
  {id:"transport",ico:"AIR",label:"Transport",bg:"#FCE8E8"},
  {id:"note",ico:"NOTE",label:"Note / Reminder",bg:"#F0F4F8"},
];

function TypePicker({onSelect,onClose,onHotelCompare}) {
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="type-box">
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"var(--ink)",marginBottom:4}}>What are you adding?</div>
        <div style={{fontSize:13,color:"var(--slate)",marginBottom:20}}>Choose a block type</div>
        {BLOCK_TYPES.map(bt=>(
          <button key={bt.id} className="tpick-btn" onClick={()=>bt.id==="stay"?onHotelCompare():onSelect(bt)}>
            <div className="tpick-ico" style={{background:bt.bg}}>{bt.ico}</div>
            <div>
              <div className="tpick-lbl">{bt.label}</div>
              {bt.id==="stay"&&<div style={{fontSize:11,color:"var(--terra)"}}>Compare options →</div>}
              {bt.id==="activity"&&<div style={{fontSize:11,color:"var(--terra)"}}>Browse & compare →</div>}
            </div>
            <span style={{marginLeft:"auto",color:"var(--mist)"}}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════ REFLECT MODAL ══════════════════════════════════════ */
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
  const canNext=()=>{if(step===1&&!expect)return false;return true;};
  return (
    <div className="overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:620}}>
        <div className="modal-hd">
          <div>
            <div className="modal-title">Trip Reflection — {dest}</div>
            <div className="modal-sub" style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
              {STEPS.map((s,i)=>(
                <span key={i} style={{padding:"3px 10px",borderRadius:100,fontSize:10,fontFamily:"DM Mono,monospace",letterSpacing:0.5,cursor:"pointer",background:i===step?"var(--terra)":i<step?"var(--ocean)":"var(--mist)",color:i<=step?"#fff":"var(--slate)"}} onClick={()=>setStep(i)}>{i+1}</span>
              ))}
            </div>
          </div>
          <button className="x-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body" style={{padding:"28px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
            <span style={{background:"var(--ocean)",color:"#fff",fontFamily:"DM Mono,monospace",fontSize:10,padding:"3px 10px",borderRadius:100,letterSpacing:1}}>{step+1} of {STEPS.length}</span>
            <span style={{fontSize:12,color:"var(--slate)",fontFamily:"DM Mono,monospace",letterSpacing:1}}>{STEPS[step].n.toUpperCase()}</span>
          </div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:"var(--ink)",marginBottom:20,lineHeight:1.2}}>{STEPS[step].q}</div>
          {step===0&&<><div style={{fontSize:24,textAlign:"center",marginBottom:8,fontFamily:"'Cormorant Garamond',serif",fontWeight:700,color:"var(--terra)"}}>{getRankLabel(rank)}</div><div className="slider-wrap"><input type="range" min={0} max={100} value={rank} onChange={e=>setRank(+e.target.value)} className="slider-track"/><div className="slider-labels"><span>Worst ever</span><span>Solid</span><span>Favorite</span><span>Top 3</span></div></div></>}
          {step===1&&<div style={{display:"flex",flexDirection:"column",gap:10}}>{["Better than expected","Exactly what I imagined","Slightly disappointing","Not what I hoped for"].map(opt=>(<button key={opt} onClick={()=>setExpect(opt)} style={{padding:"14px 20px",borderRadius:14,border:`1.5px solid ${expect===opt?"var(--terra)":"var(--mist)"}`,background:expect===opt?"rgba(196,96,58,0.06)":"#fff",fontSize:14,color:expect===opt?"var(--terra)":"var(--ink)",cursor:"pointer",textAlign:"left",transition:"all 0.15s",fontWeight:expect===opt?600:400}}>{expect===opt?"✓ ":""}{opt}</button>))}</div>}
          {step===2&&<textarea value={sentence} onChange={e=>setSentence(e.target.value)} placeholder="What should future-you know?" style={{width:"100%",minHeight:120,padding:"14px 16px",borderRadius:14,border:"1.5px solid var(--mist)",background:"var(--foam)",fontSize:14,color:"var(--ink)",outline:"none",resize:"vertical",lineHeight:1.65}}/>}
          {step===3&&<><div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>{CHANGE_OPTIONS.map(opt=>(<button key={opt} onClick={()=>setChange(p=>p.includes(opt)?p.filter(x=>x!==opt):[...p,opt])} style={{padding:"9px 16px",borderRadius:100,border:`1.5px solid ${change.includes(opt)?"var(--ocean)":"var(--mist)"}`,background:change.includes(opt)?"var(--ocean)":"#fff",color:change.includes(opt)?"#fff":"var(--ink)",fontSize:13,cursor:"pointer",transition:"all 0.15s"}}>{change.includes(opt)?"✓ ":""}{opt}</button>))}</div><input value={changeCustom} onChange={e=>setChangeCustom(e.target.value)} className="form-inp" placeholder="Or describe in your own words..."/></>}
          {step===4&&<textarea value={bestDecision} onChange={e=>setBestDecision(e.target.value)} placeholder="e.g. Booking the small-group tour instead of the big bus." style={{width:"100%",minHeight:100,padding:"14px 16px",borderRadius:14,border:"1.5px solid var(--mist)",background:"var(--foam)",fontSize:14,color:"var(--ink)",outline:"none",resize:"vertical",lineHeight:1.65}}/>}
          {step===5&&<textarea value={regret} onChange={e=>setRegret(e.target.value)} placeholder="e.g. The 3-hour boat tour — rough seas and not worth the price." style={{width:"100%",minHeight:100,padding:"14px 16px",borderRadius:14,border:"1.5px solid var(--mist)",background:"var(--foam)",fontSize:14,color:"var(--ink)",outline:"none",resize:"vertical",lineHeight:1.65}}/>}
          {step===6&&<div style={{display:"flex",flexDirection:"column",gap:12}}>{BLOCKS_TO_REBOOK.map(b=>(<div key={b} style={{background:"#fff",borderRadius:14,padding:"14px 16px",border:"1.5px solid var(--mist)"}}><div style={{fontSize:14,fontWeight:500,color:"var(--ink)",marginBottom:10}}>{b}</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{REBOOK_OPTIONS.map(opt=>(<button key={opt} onClick={()=>setRebook(p=>({...p,[b]:opt}))} style={{padding:"7px 14px",borderRadius:100,border:`1.5px solid ${rebook[b]===opt?"var(--ocean)":"var(--mist)"}`,background:rebook[b]===opt?"var(--ocean)":"#fff",color:rebook[b]===opt?"#fff":"var(--slate)",fontSize:12,cursor:"pointer",transition:"all 0.15s"}}>{opt}</button>))}</div></div>))}</div>}
          {step===7&&<><div style={{marginBottom:16}}><label className="form-label">Give this trip a title</label><input value={title} onChange={e=>setTitle(e.target.value)} className="form-inp" placeholder='e.g. "September Sicily Food Sprint"'/></div><div style={{marginTop:20,padding:16,background:"rgba(201,168,76,0.08)",borderRadius:12,border:"1px solid rgba(201,168,76,0.2)"}}><div style={{fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:4}}>Your reflection summary</div><div style={{fontSize:12,color:"var(--slate)",lineHeight:1.7}}><div>🏆 Ranked: <strong style={{color:"var(--terra)"}}>{getRankLabel(rank)}</strong></div>{expect&&<div>💭 Expectation: <strong>{expect}</strong></div>}</div></div></>}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:28,paddingTop:20,borderTop:"1px solid var(--mist)"}}>
            <button onClick={()=>setStep(s=>Math.max(0,s-1))} style={{padding:"10px 22px",borderRadius:100,border:"1.5px solid var(--mist)",background:"none",fontSize:13,color:"var(--slate)",cursor:step===0?"not-allowed":"pointer",opacity:step===0?0.4:1}}>← Back</button>
            {step<STEPS.length-1?<button onClick={()=>canNext()&&setStep(s=>s+1)} style={{padding:"10px 28px",borderRadius:100,background:canNext()?"var(--terra)":"var(--mist)",color:canNext()?"#fff":"var(--slate)",border:"none",fontSize:13,fontWeight:600,cursor:canNext()?"pointer":"not-allowed"}}>Next</button>:<button onClick={()=>onSave({rank,expect,sentence,change,bestDecision,regret,rebook,title})} style={{padding:"10px 28px",borderRadius:100,background:"var(--ocean)",color:"#fff",border:"none",fontSize:13,fontWeight:600,cursor:"pointer"}}>Save reflection ✓</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ PHOTO STRIP ════════════════════════════════════════ */
function PhotoStrip({photos}) {
  return (
    <div className="photo-strip">
      {photos.map((p,i)=><div key={i} className="photo-thumb">{p}</div>)}
      <button className="photo-add"><span style={{fontSize:18}}>+</span><span>Photo</span></button>
    </div>
  );
}

/* ═══════════ TRIP MAP VIEW ══════════════════════════════════════ */

// Full itinerary sequence — ordered list of everything on the trip
const ITINERARY_SEQUENCE = [
  {id:"pmo",   order:0,  type:"airport",   name:"Palermo Airport (PMO)", short:"PMO",       icon:"AIR", color:"#6B9FD4", x:18, y:22, dayKey:"day1", dayLabel:"Day 1 · May 12",   time:"8:25 PM",  detail:"Arrive from JFK · Alitalia AZ 601", conf:"AZ-2840392"},
  {id:"h1",    order:1,  type:"hotel",     name:"Massimo Hotel Palermo", short:"Massimo",   icon:"HTL", color:"#C9A84C", x:22, y:28, dayKey:"day1", dayLabel:"Day 1 · May 12",   time:"10:00 PM", detail:"Corso Vittorio Emanuele · Breakfast incl.", conf:"BK-7291038"},
  {id:"a2",    order:2,  type:"activity",  name:"Mercato Ballaro",       short:"Ballaro",   icon:"MKT", color:"#C4603A", x:20, y:30, dayKey:"day1", dayLabel:"Day 1 · May 12",   time:"7:30 PM",  detail:"Street food market · ~€15pp"},
  {id:"a1",    order:3,  type:"activity",  name:"Cappella Palatina",     short:"Palatina",  icon:"ACT", color:"#C4603A", x:21, y:31, dayKey:"day2", dayLabel:"Day 2 · May 13",   time:"9:00 AM",  detail:"Byzantine mosaics · Book early", conf:"GYG-88204"},
  {id:"f1",    order:4,  type:"food",      name:"Trattoria Ai Cascinari",short:"Cascinari", icon:"EAT", color:"#9D7BE5", x:19, y:32, dayKey:"day2", dayLabel:"Day 2 · May 13",   time:"1:00 PM",  detail:"Pasta alla norma · Reservation needed"},
  {id:"a3",    order:5,  type:"activity",  name:"Ballarò Street Art Walk",short:"Street Art",icon:"ART",color:"#C4603A", x:20, y:33, dayKey:"day2", dayLabel:"Day 2 · May 13",  time:"4:00 PM",  detail:"2hr self-guided · Free"},
  {id:"t1",    order:6,  type:"transport", name:"Palermo Train Station",  short:"Palermo FS",icon:"TRN",color:"#5BAD7A", x:23, y:30, dayKey:"day3", dayLabel:"Day 3 · May 14",  time:"8:05 AM",  detail:"Palermo → Agrigento · 2hr · €12"},
  {id:"h2",    order:7,  type:"hotel",     name:"Agrigento B&B",         short:"Agrigento", icon:"HTL", color:"#C9A84C", x:32, y:68, dayKey:"day3", dayLabel:"Day 3 · May 14",   time:"12:30 PM", detail:"Old Town · Walk to temples"},
  {id:"a4",    order:8,  type:"activity",  name:"Valley of the Temples", short:"Temples",   icon:"TMP", color:"#C4603A", x:30, y:72, dayKey:"day3", dayLabel:"Day 3 · May 14",   time:"4:00 PM",  detail:"Golden hour · Book online", conf:"VIA-49201"},
  {id:"cta",   order:9,  type:"airport",   name:"Catania Airport (CTA)", short:"CTA",       icon:"AIR", color:"#6B9FD4", x:74, y:52, dayKey:"day7", dayLabel:"Day 7 · May 19",   time:"2:15 PM",  detail:"Return flight · Allow 90min transfer"},
];

// Group by day for the panel
const DAYS_GROUPED = [
  {key:"day1", label:"Day 1", date:"May 12", theme:"Arrival & Palermo", icon:"01"},
  {key:"day2", label:"Day 2", date:"May 13", theme:"Palermo Deep Dive",  icon:"02"},
  {key:"day3", label:"Day 3", date:"May 14", theme:"Agrigento",          icon:"03"},
  {key:"day7", label:"Day 7", date:"May 19", theme:"Departure",          icon:"07"},
];

// Travel connections between sequential stops
const TRAVEL_LEGS = [
  {from:"pmo",  to:"h1",  mode:"taxi",  duration:"45 min", dist:"35 km",  note:"Fixed rate ~€35"},
  {from:"h1",   to:"a2",  mode:"walk",  duration:"8 min",  dist:"0.7 km", note:"Evening stroll"},
  {from:"a2",   to:"h1",  mode:"walk",  duration:"8 min",  dist:"0.7 km", note:"Return to hotel"},
  {from:"h1",   to:"a1",  mode:"walk",  duration:"5 min",  dist:"0.4 km", note:"Right in the centre"},
  {from:"a1",   to:"f1",  mode:"walk",  duration:"10 min", dist:"0.8 km", note:"Head to Vucciria"},
  {from:"f1",   to:"a3",  mode:"walk",  duration:"3 min",  dist:"0.2 km", note:"Start loop nearby"},
  {from:"a3",   to:"h1",  mode:"walk",  duration:"12 min", dist:"1 km",   note:"Back to hotel"},
  {from:"h1",   to:"t1",  mode:"walk",  duration:"7 min",  dist:"0.6 km", note:"Easy walk with luggage"},
  {from:"t1",   to:"h2",  mode:"train", duration:"2 hr",   dist:"128 km", note:"Trenitalia · departs 8:05"},
  {from:"h2",   to:"a4",  mode:"walk",  duration:"18 min", dist:"1.5 km", note:"Or 5 min taxi"},
  {from:"a4",   to:"h2",  mode:"walk",  duration:"18 min", dist:"1.5 km", note:"Return at dusk"},
  {from:"h2",   to:"cta", mode:"drive", duration:"1 hr 50 min", dist:"110 km", note:"Car hire or taxi €85"},
];

const MODE_STYLE = {
  walk:   {color:"#C4603A", dash:"3,3",  width:1.8, icon:"Walk"},
  taxi:   {color:"#6B9FD4", dash:"5,3",  width:2,   icon:"Taxi"},
  train:  {color:"#5BAD7A", dash:"8,2",  width:2.5, icon:"Train"},
  drive:  {color:"#C9A84C", dash:"6,3",  width:2,   icon:"Drive"},
};
const TYPE_COLOR = {airport:"#6B9FD4", hotel:"#C9A84C", activity:"#C4603A", food:"#9D7BE5", transport:"#5BAD7A"};
const TYPE_LABEL = {airport:"Airport", hotel:"Hotel", activity:"Activity", food:"Restaurant", transport:"Station"};

const MAP_W = 680, MAP_H = 480;
const toSvg = p => ({ x: (p.x / 100) * MAP_W, y: (p.y / 100) * MAP_H });

function distKm(a, b) {
  const dx = (b.x - a.x) * 1.8;
  const dy = (b.y - a.y) * 1.4;
  return Math.round(Math.sqrt(dx*dx + dy*dy));
}

function TripMapView() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({x: 0, y: 0});
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showRoutes, setShowRoutes] = useState(true);
  const [collapsedDays, setCollapsedDays] = useState({});
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const lastPan = useRef({x:0,y:0});

  const selectedPlace = ITINERARY_SEQUENCE.find(p => p.id === selected);
  const selectedIdx = selectedPlace ? selectedPlace.order : -1;
  const prevPlace = selectedIdx > 0 ? ITINERARY_SEQUENCE[selectedIdx - 1] : null;
  const nextPlace = selectedIdx >= 0 && selectedIdx < ITINERARY_SEQUENCE.length - 1 ? ITINERARY_SEQUENCE[selectedIdx + 1] : null;
  const legBefore = prevPlace ? TRAVEL_LEGS.find(l => l.from === prevPlace.id && l.to === selected) : null;
  const legAfter = nextPlace ? TRAVEL_LEGS.find(l => l.from === selected && l.to === nextPlace.id) : null;

  // Zoom/pan handlers
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.85 : 1.18;
    setZoom(z => Math.min(4, Math.max(0.6, z * delta)));
  }, []);

  // Attach wheel as non-passive so preventDefault works
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setDragging(true);
    setDragStart({x: e.clientX - lastPan.current.x, y: e.clientY - lastPan.current.y});
  };
  const handleMouseMove = (e) => {
    if (!dragging || !dragStart) return;
    const nx = e.clientX - dragStart.x;
    const ny = e.clientY - dragStart.y;
    lastPan.current = {x: nx, y: ny};
    setPan({x: nx, y: ny});
  };
  const handleMouseUp = () => { setDragging(false); };

  const zoomIn  = () => setZoom(z => Math.min(4, z * 1.3));
  const zoomOut = () => setZoom(z => Math.max(0.6, z / 1.3));
  const resetView = () => { setZoom(1); setPan({x:0,y:0}); lastPan.current={x:0,y:0}; };

  const toggleDay = (key) => setCollapsedDays(p => ({...p, [key]: !p[key]}));

  const focusOn = (place) => {
    // Clicking the already-selected place deselects
    if (selected === place.id) { setSelected(null); return; }
    // Center the map on a clicked place
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const {x: px2, y: py2} = toSvg(place);
    const newZoom = Math.min(3.2, zoom < 1.5 ? 2.2 : zoom);
    const newPanX = cx - px2 * newZoom;
    const newPanY = cy - py2 * newZoom;
    setZoom(newZoom);
    setPan({x: newPanX, y: newPanY});
    lastPan.current = {x: newPanX, y: newPanY};
    setSelected(place.id);
  };

  // Which legs to show highlighted
  const highlightedLegIds = new Set();
  if (selected) {
    if (legBefore) highlightedLegIds.add(`${legBefore.from}-${legBefore.to}`);
    if (legAfter)  highlightedLegIds.add(`${legAfter.from}-${legAfter.to}`);
  }

  // Visible routes between sequential itinerary stops
  const uniqueLegs = TRAVEL_LEGS.filter((leg, i, arr) =>
    arr.findIndex(l => l.from === leg.from && l.to === leg.to) === i
  );

  const FILTERS = [
    {id:"all",label:"All"},
    {id:"airport",label:"Air"},
    {id:"hotel",label:"Hotel"},
    {id:"activity",label:"Act"},
    {id:"food",label:"Food"},
    {id:"transport",label:"Rail"},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
        <div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:"var(--ink)",lineHeight:1}}>Trip Map</div>
          <div style={{fontSize:12,color:"var(--slate)",marginTop:3}}>Sicily, Italy · May 12–19 · Scroll to zoom · Drag to pan · Click a stop to explore</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
          <button onClick={()=>setShowRoutes(r=>!r)} style={{padding:"6px 13px",borderRadius:100,border:"1.5px solid var(--mist)",background:showRoutes?"var(--ocean)":"none",color:showRoutes?"#fff":"var(--slate)",fontSize:10,cursor:"pointer",fontFamily:"DM Mono,monospace",transition:"all 0.15s"}}>
            {showRoutes?"Routes ON":"Routes OFF"}
          </button>
          <button onClick={resetView} style={{padding:"6px 13px",borderRadius:100,border:"1.5px solid var(--mist)",background:"none",color:"var(--slate)",fontSize:10,cursor:"pointer",fontFamily:"DM Mono,monospace"}}>Reset view</button>
        </div>
      </div>

      <div className="tripmap-root" style={{height:600}}>
        {/* Top filter bar */}
        <div className="tripmap-topbar">
          <span style={{fontSize:9,color:"var(--slate)",fontFamily:"DM Mono,monospace",letterSpacing:1,textTransform:"uppercase",marginRight:4}}>Filter</span>
          {FILTERS.map(f=>(
            <button key={f.id} className={`tripmap-filter ${filter===f.id?"active":""}`} onClick={()=>setFilter(f.id)}>{f.label}</button>
          ))}
          <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
            {[
              {mode:"walk",label:"Walk"},{mode:"taxi",label:"Taxi"},
              {mode:"train",label:"Train"},{mode:"drive",label:"Drive"},
            ].map(({mode,label})=>(
              <div key={mode} style={{display:"flex",alignItems:"center",gap:4}}>
                <svg width="16" height="5"><line x1="0" y1="2.5" x2="16" y2="2.5" stroke={MODE_STYLE[mode].color} strokeWidth="1.5" strokeDasharray={MODE_STYLE[mode].dash}/></svg>
                <span style={{fontSize:9,color:"rgba(255,255,255,0.35)",fontFamily:"DM Mono,monospace"}}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="tripmap-body">
          {/* Map canvas */}
          <div
            ref={containerRef}
            className="tripmap-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{position:"relative"}}
          >
            <svg
              ref={svgRef}
              width="100%" height="100%"
              viewBox={`0 0 ${MAP_W} ${MAP_H}`}
              style={{
                display:"block",
                transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
                transformOrigin:"top left",
                transition: dragging ? "none" : "transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
                userSelect:"none",
              }}
            >
              <defs>
                <radialGradient id="seaG" cx="50%" cy="60%">
                  <stop offset="0%" stopColor="#9ecce0"/>
                  <stop offset="100%" stopColor="#7ab0c8"/>
                </radialGradient>
                <radialGradient id="landG" cx="35%" cy="30%">
                  <stop offset="0%" stopColor="#deebc8"/>
                  <stop offset="60%" stopColor="#cad8b0"/>
                  <stop offset="100%" stopColor="#b8c8a0"/>
                </radialGradient>
                <filter id="mkShadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="rgba(0,0,0,0.35)"/>
                </filter>
                <filter id="lblGlow" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="1.5" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {/* Sea */}
              <rect width={MAP_W} height={MAP_H} fill="url(#seaG)"/>
              {/* Wave texture */}
              {Array.from({length:14},(_,i)=>i*32+40).map(y=>(
                <path key={y} d={`M0,${y} C${MAP_W*.2},${y-6} ${MAP_W*.4},${y+6} ${MAP_W*.6},${y} C${MAP_W*.8},${y-5} ${MAP_W},${y+4} ${MAP_W},${y}`}
                  stroke="rgba(255,255,255,0.18)" strokeWidth="0.7" fill="none"/>
              ))}

              {/* Sicily island — more detailed path */}
              <path
                d="M40,38 L58,28 L80,22 L115,18 L155,16 L195,20 L235,24 L270,21 L310,26 L345,22 L385,28 L415,34 L440,38 L458,46 L465,56 L460,68 L450,80 L435,92 L418,104 L395,112 L370,116 L345,114 L320,120 L295,118 L270,122 L245,118 L220,122 L195,115 L172,118 L148,112 L125,116 L100,110 L80,104 L62,96 L48,82 L38,68 L36,54 Z"
                fill="url(#landG)" stroke="#b0c898" strokeWidth="1.5"
                transform="scale(1.42,1.42) translate(-2,4)"
              />

              {/* Etna volcano hint */}
              <ellipse cx="390" cy="120" rx="28" ry="16" fill="rgba(160,140,110,0.35)" transform="rotate(-8,390,120)"/>
              <ellipse cx="390" cy="112" rx="12" ry="8" fill="rgba(140,120,90,0.4)" transform="rotate(-8,390,112)"/>
              {/* Hill shading */}
              <ellipse cx="200" cy="160" rx="50" ry="22" fill="rgba(160,190,120,0.3)" transform="rotate(-5,200,160)"/>
              <ellipse cx="300" cy="130" rx="35" ry="18" fill="rgba(155,185,115,0.28)"/>
              <ellipse cx="130" cy="180" rx="28" ry="14" fill="rgba(160,190,120,0.25)"/>

              {/* Map grid */}
              <g opacity="0.08">
                {[0.2,0.4,0.6,0.8].map(x=><line key={x} x1={MAP_W*x} y1={0} x2={MAP_W*x} y2={MAP_H} stroke="#0D2B45" strokeWidth="0.5" strokeDasharray="3,5"/>)}
                {[0.25,0.5,0.75].map(y=><line key={y} x1={0} y1={MAP_H*y} x2={MAP_W} y2={MAP_H*y} stroke="#0D2B45" strokeWidth="0.5" strokeDasharray="3,5"/>)}
              </g>

              {/* Compass */}
              <g transform={`translate(${MAP_W-50},${MAP_H-50})`} opacity="0.65">
                <circle cx="20" cy="20" r="18" fill="rgba(13,43,69,0.18)" stroke="rgba(13,43,69,0.35)" strokeWidth="1"/>
                {[["N",20,9],["S",20,34],["W",7,22],["E",33,22]].map(([d,x,y])=>(
                  <text key={d} x={x} y={y} textAnchor="middle" fontSize={d==="N"?8:6.5} fill="#0D2B45" fontWeight={d==="N"?"700":"400"}>{d}</text>
                ))}
                <polygon points="20,11 22,20 20,18 18,20" fill="#C4603A"/>
                <polygon points="20,29 22,20 20,22 18,20" fill="#666"/>
                <circle cx="20" cy="20" r="2.5" fill="#fff" stroke="#0D2B45" strokeWidth="0.8"/>
              </g>

              {/* Scale */}
              <g transform={`translate(18,${MAP_H-18})`} opacity="0.55">
                <line x1="0" y1="0" x2="60" y2="0" stroke="#0D2B45" strokeWidth="1.5"/>
                <line x1="0" y1="-4" x2="0" y2="4" stroke="#0D2B45" strokeWidth="1.5"/>
                <line x1="60" y1="-4" x2="60" y2="4" stroke="#0D2B45" strokeWidth="1.5"/>
                <text x="30" y="-7" textAnchor="middle" fontSize="8" fill="#0D2B45" fontFamily="DM Mono,monospace">~100 km</text>
              </g>

              {/* Palermo / Agrigento / Catania city labels */}
              {[
                {name:"Palermo",x:22,y:26},{name:"Agrigento",x:30,y:66},{name:"Catania",x:72,y:48},{name:"Messina",x:80,y:28},{name:"Siracusa",x:78,y:72},
              ].map(city=>{
                const c = {x:(city.x/100)*MAP_W, y:(city.y/100)*MAP_H};
                return <text key={city.name} x={c.x} y={c.y} fontSize="8" fill="rgba(10,31,48,0.45)" fontFamily="DM Mono,monospace" fontStyle="italic" textAnchor="middle" style={{userSelect:"none",pointerEvents:"none"}}>{city.name}</text>
              })}

              {/* ── Route legs ── */}
              {showRoutes && uniqueLegs.map(leg => {
                const fromP = ITINERARY_SEQUENCE.find(p=>p.id===leg.from);
                const toP   = ITINERARY_SEQUENCE.find(p=>p.id===leg.to);
                if (!fromP||!toP) return null;
                const f = toSvg(fromP), t2 = toSvg(toP);
                const legKey = `${leg.from}-${leg.to}`;
                const isHigh = highlightedLegIds.has(legKey);
                const st = MODE_STYLE[leg.mode] || MODE_STYLE.drive;
                const isVis = filter==="all" || fromP.type===filter || toP.type===filter;
                // Curved control point
                const perpX = -(t2.y - f.y) * 0.22;
                const perpY =  (t2.x - f.x) * 0.22;
                const mx = (f.x+t2.x)/2 + perpX, my = (f.y+t2.y)/2 + perpY;
                return (
                  <g key={legKey}>
                    <path d={`M${f.x},${f.y} Q${mx},${my} ${t2.x},${t2.y}`}
                      stroke={st.color}
                      strokeWidth={isHigh ? st.width*2.2 : st.width}
                      strokeDasharray={st.dash}
                      fill="none"
                      opacity={!isVis ? 0.05 : selected ? (isHigh ? 1 : 0.12) : 0.5}
                      style={{transition:"opacity 0.22s,stroke-width 0.18s"}}
                    />
                    {/* Pulsing dot at midpoint of highlighted leg */}
                    {isHigh && (
                      <circle cx={mx} cy={my} r="5" fill={st.color} opacity="0.9"
                        style={{animation:"mapPulse 1.5s ease-in-out infinite", transformOrigin:`${mx}px ${my}px`}}
                      />
                    )}
                    {/* Duration label on highlighted */}
                    {isHigh && (
                      <g>
                        <rect x={mx-22} y={my-10} width={44} height={16} rx="8" fill="rgba(7,24,37,0.82)" stroke={st.color} strokeWidth="0.8"/>
                        <text x={mx} y={my+1} textAnchor="middle" fontSize="8" fill={st.color} fontFamily="DM Mono,monospace" fontWeight="600">{leg.duration}</text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* ── Place markers ── */}
              {ITINERARY_SEQUENCE.map((place, idx) => {
                const c = toSvg(place);
                const isSel = place.id === selected;
                const isVis = filter === "all" || place.type === filter;
                const col = TYPE_COLOR[place.type];
                const size = 13;
                // connected to selected?
                const isConnected = selected && (
                  (prevPlace?.id === place.id) ||
                  (nextPlace?.id === place.id)
                );
                return (
                  <g key={place.id}
                    style={{cursor:"pointer", opacity: isVis ? 1 : 0.12, transition:"opacity 0.2s"}}
                    onClick={(e)=>{e.stopPropagation(); focusOn(place);}}
                  >
                    {/* Pulse ring when selected */}
                    {isSel && (
                      <circle cx={c.x} cy={c.y} r="16" fill="none"
                        stroke={col} strokeWidth="2"
                        style={{
                          animation:"mapPulse 2s ease-in-out infinite",
                          transformOrigin:`${c.x}px ${c.y}px`,
                        }}
                      />
                    )}
                    {/* Glow for connected */}
                    {isConnected && !isSel && (
                      <circle cx={c.x} cy={c.y} r="18" fill={col} opacity="0.1"/>
                    )}
                    {/* Main marker */}
                    <circle cx={c.x} cy={c.y} r={size}
                      fill={isSel ? "#fff" : col}
                      stroke={isSel ? col : "rgba(255,255,255,0.5)"}
                      strokeWidth={isSel ? 2.5 : 1.2}
                      filter="url(#mkShadow)"
                      style={{transition:"all 0.18s"}}
                    />
                    {/* Order number badge */}
                    <circle cx={c.x+10} cy={c.y-10} r="7"
                      fill={isSel ? col : "rgba(7,24,37,0.85)"}
                      stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>
                    <text x={c.x+10} y={c.y-10+1} textAnchor="middle" dominantBaseline="middle"
                      fontSize="7" fill="#fff" fontFamily="DM Mono,monospace" fontWeight="700"
                      style={{userSelect:"none",pointerEvents:"none"}}>
                      {idx+1}
                    </text>
                    {/* Icon */}
                    <text x={c.x} y={c.y+0.5} textAnchor="middle" dominantBaseline="middle"
                      fontSize="11" style={{userSelect:"none",pointerEvents:"none"}}
                      fill={isSel ? col : "#fff"}>
                      {place.icon}
                    </text>
                    {/* Name label */}
                    <text x={c.x} y={c.y+size+10} textAnchor="middle"
                      fontSize="8" fill="#0a1f30" fontFamily="DM Mono,monospace" fontWeight="700"
                      paintOrder="stroke" stroke="rgba(255,255,255,0.85)" strokeWidth="3.5" strokeLinejoin="round"
                      style={{userSelect:"none",pointerEvents:"none"}}>
                      {place.short}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Zoom controls */}
            <div className="zoom-ctrl">
              <button className="zoom-btn" onClick={zoomIn} title="Zoom in">+</button>
              <button className="zoom-btn" onClick={zoomOut} title="Zoom out">−</button>
            </div>

            {/* Zoom indicator */}
            <div style={{position:"absolute",bottom:16,left:64,background:"rgba(7,24,37,0.7)",borderRadius:6,padding:"3px 9px",fontFamily:"DM Mono,monospace",fontSize:9,color:"rgba(255,255,255,0.45)",pointerEvents:"none"}}>
              {Math.round(zoom*100)}%
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="tripmap-panel">
            <div className="tripmap-panel-hd">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                <div>
                  <div className="tripmap-panel-title">Itinerary</div>
                  <div className="tripmap-panel-sub">Sicily · 3 days shown</div>
                </div>
                {selected && (
                  <button onClick={()=>setSelected(null)}
                    style={{padding:"3px 10px",borderRadius:100,border:"1px solid rgba(196,96,58,0.4)",background:"rgba(196,96,58,0.12)",color:"var(--terra-lt)",fontSize:9,cursor:"pointer",fontFamily:"DM Mono,monospace",letterSpacing:0.5,transition:"all 0.15s"}}
                    title="Click again on any stop or press this to deselect">
                    Deselect
                  </button>
                )}
              </div>
              {/* Legend */}
              <div style={{display:"flex",flexWrap:"wrap",gap:6,paddingBottom:10,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                {Object.entries(TYPE_COLOR).map(([type,col])=>(
                  <div key={type} style={{display:"flex",alignItems:"center",gap:3,fontSize:8,color:"rgba(255,255,255,0.4)"}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:col,flexShrink:0}}/>
                    {TYPE_LABEL[type]}
                  </div>
                ))}
              </div>
            </div>

            {/* Day-grouped stop list */}
            <div className="tripmap-places">
              {DAYS_GROUPED.map(day => {
                const dayPlaces = ITINERARY_SEQUENCE.filter(p => p.dayKey === day.key);
                if (dayPlaces.length === 0) return null;
                const isCollapsed = collapsedDays[day.key];
                const hasSelected = dayPlaces.some(p => p.id === selected);

                return (
                  <div key={day.key} style={{marginBottom:6}}>
                    {/* Day header — clickable to collapse */}
                    <button
                      onClick={() => toggleDay(day.key)}
                      style={{
                        width:"100%", display:"flex", alignItems:"center", gap:8,
                        padding:"7px 10px", borderRadius:9,
                        background: hasSelected ? "rgba(196,96,58,0.12)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${hasSelected ? "rgba(196,96,58,0.3)" : "rgba(255,255,255,0.07)"}`,
                        cursor:"pointer", transition:"all 0.15s", marginBottom: isCollapsed ? 0 : 4,
                      }}
                    >
                      <span style={{fontSize:13}}>{day.icon}</span>
                      <div style={{flex:1, textAlign:"left"}}>
                        <div style={{fontSize:10, fontWeight:600, color: hasSelected ? "var(--terra-lt)" : "#fff", lineHeight:1}}>
                          {day.label} <span style={{fontFamily:"DM Mono,monospace",fontSize:8,color:"var(--slate)",fontWeight:400,marginLeft:4}}>{day.date}</span>
                        </div>
                        <div style={{fontSize:8,color:"var(--slate)",fontFamily:"DM Mono,monospace",marginTop:2}}>{day.theme}</div>
                      </div>
                      <span style={{fontSize:9,color:"rgba(255,255,255,0.3)",transition:"transform 0.2s",display:"inline-block",transform:isCollapsed?"rotate(-90deg)":"rotate(0deg)"}}>▾</span>
                    </button>

                    {/* Stops within this day */}
                    {!isCollapsed && (
                      <div style={{paddingLeft:8}}>
                        {dayPlaces.map((place, dayIdx) => {
                          const isSel = place.id === selected;
                          const col = TYPE_COLOR[place.type];
                          const globalIdx = place.order;

                          // Find travel leg to next stop in global sequence
                          const nextGlobal = ITINERARY_SEQUENCE[globalIdx + 1];
                          const legToNext = nextGlobal
                            ? (TRAVEL_LEGS.find(l => l.from === place.id && l.to === nextGlobal.id) || null)
                            : null;
                          const isLastInDay = dayIdx === dayPlaces.length - 1;
                          const showLeg = legToNext != null;

                          return (
                            <div key={place.id}>
                              {/* Stop card */}
                              <div
                                onClick={() => focusOn(place)}
                                style={{
                                  display:"flex", alignItems:"center", gap:8,
                                  padding:"7px 8px", borderRadius:8, cursor:"pointer",
                                  background: isSel ? "rgba(196,96,58,0.18)" : "transparent",
                                  border: `1px solid ${isSel ? "rgba(196,96,58,0.4)" : "transparent"}`,
                                  transition:"all 0.15s", marginBottom:0, position:"relative",
                                }}
                                onMouseEnter={e => { if(!isSel) e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}
                                onMouseLeave={e => { if(!isSel) e.currentTarget.style.background="transparent"; }}
                              >
                                {/* Timeline spine + icon */}
                                <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0,width:28}}>
                                  <div style={{
                                    width:26,height:26,borderRadius:7,
                                    background:`${col}${isSel?"40":"20"}`,
                                    display:"flex",alignItems:"center",justifyContent:"center",
                                    fontSize:13,
                                    border:`1.5px solid ${isSel ? col : `${col}60`}`,
                                    boxShadow: isSel ? `0 0 8px ${col}50` : "none",
                                    transition:"all 0.18s",
                                  }}>
                                    {place.icon}
                                  </div>
                                </div>

                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{
                                    fontSize:11, fontWeight:isSel?600:500,
                                    color: isSel ? "#fff" : "rgba(255,255,255,0.78)",
                                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                                    marginBottom:1, lineHeight:1.25,
                                  }}>{place.name}</div>
                                  <div style={{fontSize:8,color:"var(--slate)",fontFamily:"DM Mono,monospace"}}>{place.time}</div>
                                </div>

                                {/* Selected indicator */}
                                {isSel && (
                                  <div style={{width:5,height:5,borderRadius:"50%",background:col,flexShrink:0,boxShadow:`0 0 5px ${col}`}}/>
                                )}
                              </div>

                              {/* Travel time connector */}
                              {showLeg && (
                                <div style={{
                                  display:"flex", alignItems:"center", gap:0,
                                  paddingLeft:8, marginBottom:0,
                                }}>
                                  {/* Vertical spine line */}
                                  <div style={{
                                    width:26, display:"flex", justifyContent:"center", flexShrink:0,
                                  }}>
                                    <div style={{
                                      width:1.5,
                                      height: isLastInDay ? 22 : 22,
                                      background:`linear-gradient(to bottom, ${MODE_STYLE[legToNext.mode]?.color||"#555"}99, ${isLastInDay?"transparent":(MODE_STYLE[legToNext.mode]?.color||"#555")+"60"})`,
                                    }}/>
                                  </div>

                                  {/* Travel pill */}
                                  <div style={{
                                    display:"flex", alignItems:"center", gap:5,
                                    padding:"3px 8px", marginLeft:4,
                                    background:"rgba(255,255,255,0.04)",
                                    borderRadius:100,
                                    border:`1px solid rgba(255,255,255,0.07)`,
                                  }}>
                                    <span style={{fontSize:9}}>{MODE_STYLE[legToNext.mode]?.icon}</span>
                                    <svg width="16" height="3" style={{flexShrink:0}}>
                                      <line x1="0" y1="1.5" x2="16" y2="1.5"
                                        stroke={MODE_STYLE[legToNext.mode]?.color||"#888"}
                                        strokeWidth="1.5"
                                        strokeDasharray={MODE_STYLE[legToNext.mode]?.dash||"4,2"}/>
                                    </svg>
                                    <span style={{fontSize:8,fontFamily:"DM Mono,monospace",color:MODE_STYLE[legToNext.mode]?.color||"#888",fontWeight:600,whiteSpace:"nowrap"}}>
                                      {legToNext.duration}
                                    </span>
                                    <span style={{fontSize:8,fontFamily:"DM Mono,monospace",color:"rgba(255,255,255,0.25)",whiteSpace:"nowrap"}}>
                                      {legToNext.dist}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected detail drawer */}
            <div className={`tripmap-drawer ${selected?"open":""}`}>
              {selectedPlace && (
                <div style={{padding:"16px",animation:"drawerIn 0.25s ease"}}>
                  {/* Header */}
                  <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:14}}>
                    <div style={{width:38,height:38,borderRadius:10,background:`${TYPE_COLOR[selectedPlace.type]}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,border:`1.5px solid ${TYPE_COLOR[selectedPlace.type]}`,flexShrink:0}}>
                      {selectedPlace.icon}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:"#fff",lineHeight:1.2,marginBottom:2}}>{selectedPlace.name}</div>
                      <div style={{fontSize:9,color:TYPE_COLOR[selectedPlace.type],fontFamily:"DM Mono,monospace",letterSpacing:1,textTransform:"uppercase"}}>{TYPE_LABEL[selectedPlace.type]}</div>
                    </div>
                    {selectedPlace.conf && (
                      <div style={{fontSize:8,fontFamily:"DM Mono,monospace",color:"var(--slate)",background:"rgba(255,255,255,0.05)",padding:"2px 7px",borderRadius:100,flexShrink:0}}>#{selectedPlace.conf}</div>
                    )}
                  </div>

                  <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",lineHeight:1.6,marginBottom:12}}>{selectedPlace.detail}</div>

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {/* Before */}
                    <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 11px",border:"1px solid rgba(255,255,255,0.07)"}}>
                      <div style={{fontSize:8,fontFamily:"DM Mono,monospace",color:"var(--slate)",letterSpacing:1,marginBottom:6,textTransform:"uppercase"}}>← Before</div>
                      {prevPlace ? (
                        <>
                          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:5}}>
                            <span style={{fontSize:12}}>{prevPlace.icon}</span>
                            <div style={{fontSize:10,color:"rgba(255,255,255,0.75)",fontWeight:500,lineHeight:1.3}}>{prevPlace.short}</div>
                          </div>
                          {legBefore && (
                            <div style={{display:"flex",gap:4,alignItems:"center"}}>
                              <svg width="14" height="4"><line x1="0" y1="2" x2="14" y2="2" stroke={MODE_STYLE[legBefore.mode]?.color||"#888"} strokeWidth="1.5" strokeDasharray={MODE_STYLE[legBefore.mode]?.dash||"4,2"}/></svg>
                              <span style={{fontSize:9,color:MODE_STYLE[legBefore.mode]?.color||"#888",fontFamily:"DM Mono,monospace"}}>{legBefore.duration}</span>
                              <span style={{fontSize:8,color:"rgba(255,255,255,0.25)",fontFamily:"DM Mono,monospace"}}>{legBefore.dist}</span>
                            </div>
                          )}
                          {legBefore && <div style={{fontSize:8,color:"rgba(255,255,255,0.3)",marginTop:3,lineHeight:1.4}}>{legBefore.note}</div>}
                        </>
                      ) : <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",fontFamily:"DM Mono,monospace"}}>Start of trip</div>}
                    </div>

                    {/* After */}
                    <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 11px",border:"1px solid rgba(255,255,255,0.07)"}}>
                      <div style={{fontSize:8,fontFamily:"DM Mono,monospace",color:"var(--slate)",letterSpacing:1,marginBottom:6,textTransform:"uppercase"}}>After →</div>
                      {nextPlace ? (
                        <>
                          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:5}}>
                            <span style={{fontSize:12}}>{nextPlace.icon}</span>
                            <div style={{fontSize:10,color:"rgba(255,255,255,0.75)",fontWeight:500,lineHeight:1.3}}>{nextPlace.short}</div>
                          </div>
                          {legAfter && (
                            <div style={{display:"flex",gap:4,alignItems:"center"}}>
                              <svg width="14" height="4"><line x1="0" y1="2" x2="14" y2="2" stroke={MODE_STYLE[legAfter.mode]?.color||"#888"} strokeWidth="1.5" strokeDasharray={MODE_STYLE[legAfter.mode]?.dash||"4,2"}/></svg>
                              <span style={{fontSize:9,color:MODE_STYLE[legAfter.mode]?.color||"#888",fontFamily:"DM Mono,monospace"}}>{legAfter.duration}</span>
                              <span style={{fontSize:8,color:"rgba(255,255,255,0.25)",fontFamily:"DM Mono,monospace"}}>{legAfter.dist}</span>
                            </div>
                          )}
                          {legAfter && <div style={{fontSize:8,color:"rgba(255,255,255,0.3)",marginTop:3,lineHeight:1.4}}>{legAfter.note}</div>}
                        </>
                      ) : <div style={{fontSize:9,color:"rgba(255,255,255,0.25)",fontFamily:"DM Mono,monospace"}}>End of trip</div>}
                    </div>
                  </div>

                  {/* Dist to all key places */}
                  <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                    <div style={{fontSize:8,fontFamily:"DM Mono,monospace",color:"var(--slate)",letterSpacing:1,marginBottom:7,textTransform:"uppercase"}}>Distances from here</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                      {ITINERARY_SEQUENCE.filter(p=>p.id!==selected).slice(0,5).map(p=>(
                        <div key={p.id} style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.05)",borderRadius:100,padding:"2px 8px"}}>
                          <span style={{fontSize:9}}>{p.icon}</span>
                          <span style={{fontSize:8,color:"rgba(255,255,255,0.5)",fontFamily:"DM Mono,monospace"}}>{p.short}</span>
                          <span style={{fontSize:8,color:TYPE_COLOR[p.type],fontFamily:"DM Mono,monospace",fontWeight:600}}>~{distKm(selectedPlace,p)}km</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ EXISTING TRIP VIEW ═════════════════════════════════ */
function ExistingTrip() {
  const [mainTab, setMainTab] = useState("itinerary");
  const [exp,setExp]=useState({0:true,1:false,2:false});
  const [blocks,setBlocks]=useState(()=>{
    const m={};
    DAYS_SICILY.forEach((d,i)=>{m[i]=d.blocks.map(b=>({...b}));});
    return m;
  });
  const [selVibes,setSelVibes]=useState(["foodie","cultural","romantic"]);
  const [showReflect,setShowReflect]=useState(false);
  const [reflected,setReflected]=useState(null);
  const [tripStatus,setTripStatus]=useState("active"); // active | draft | past
  const [editing,setEditing]=useState(false);
  const [details,setDetails]=useState({dest:"Sicily, Italy",dates:"May 12–19",days:"7",travelers:"2",budget:"3,200",theme:"Foodie escape with culture and coastal stops"});
  const [draftDetails,setDraftDetails]=useState({...details});
  const [typePicker,setTypePicker]=useState(null);
  const [actModal,setActModal]=useState(null);
  const [hotelModal,setHotelModal]=useState(null);
  const [savedItems,setSavedItems]=useState(INITIAL_SAVED_ITEMS);
  const [todos,setTodos]=useState(SMART_TODO.map((t,i)=>({...t,id:i})));
  const travelers=parseInt(details.travelers)||2;

  const toggleVibe=id=>setSelVibes(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const saveDetails=()=>{setDetails({...draftDetails});setEditing(false);};
  const cancelEdit=()=>{setDraftDetails({...details});setEditing(false);};
  const handleEditBlock=(dayIdx,updated)=>{setBlocks(p=>({...p,[dayIdx]:p[dayIdx].map(b=>b.id===updated.id?updated:b)}));};
  const handleDeleteBlock=(dayIdx,id)=>{if(window.confirm("Remove this block?")){setBlocks(p=>({...p,[dayIdx]:p[dayIdx].filter(b=>b.id!==id)}));}};
  const handleTypeSelect=(bt,dayIdx)=>{setTypePicker(null);if(bt.id==="activity"){setActModal(dayIdx);return;}const newBlock={id:Date.now(),...bt,title:`New ${bt.label}`,detail:"Tap to add details",price:"",status:"pending",time:"",slot:"morning",cancelTiers:null,conf:null};setBlocks(p=>({...p,[dayIdx]:[...(p[dayIdx]||[]),newBlock]}));};
  const handleAddTour=(tour,actName,dayIdx)=>{setActModal(null);const newBlock={id:Date.now(),type:"activity",ico:"🏔",bg:"#EEF0FA",label:"activity",title:actName,detail:`${tour.company} · ${tour.duration} · ★${tour.rating}`,price:`$${tour.price}`,status:"pending",cancelTiers:null,time:"",slot:"morning",conf:null};setBlocks(p=>({...p,[dayIdx]:[...(p[dayIdx]||[]),newBlock]}));};
  const handleAddHotel=(hotel)=>{const dayIdx=hotelModal;setHotelModal(null);const newBlock={id:Date.now(),type:"stay",ico:"HTL",bg:"#E3EEF5",label:"stay",title:hotel.name,detail:`${hotel.location} · ★${hotel.rating}`,price:`$${hotel.price}/nt`,status:"pending",cancelTiers:[{days:7,pct:100},{days:3,pct:50},{days:0,pct:0}],time:"3:00 PM",slot:"afternoon",conf:null};setBlocks(p=>({...p,[dayIdx]:[...(p[dayIdx]||[]),newBlock]}));};

  const SLOTS=[["morning","Morning"],["afternoon","Afternoon"],["evening","Evening"]];
  const donePct=Math.round(todos.filter(t=>t.done).length/todos.length*100);
  const catColors={"Booking":"var(--terra)","Admin":"var(--ocean)","Activity":"var(--gold)","Food":"var(--green)","Prep":"var(--slate)","Transport":"var(--amber)"};
  const totalSpent=BUDGET_ITEMS.reduce((s,b)=>s+b.spent,0);
  const totalBudget=BUDGET_ITEMS.reduce((s,b)=>s+b.budget,0);

  const todoRemaining=todos.filter(t=>!t.done).length;
  const MAIN_TABS=[
    {id:"itinerary", label:"Itinerary",  icon:"CAL"},
    {id:"map",       label:"Map View",   icon:"MAP"},
    {id:"todo",      label:"To Do",      icon:"CHK",  badge: tripStatus!=="past"&&todoRemaining||null},
    {id:"budget",    label:"Budget",     icon:"$"},
    {id:"research",  label:"Research",   icon:"LUX"},
    {id:"saved",     label:"Saved",      icon:"LNK", badge: savedItems.length||null},
  ];

  return <>
    {/* Status-aware banners */}
    {tripStatus==="draft" && (
      <div style={{background:"rgba(201,168,76,0.08)",border:"1.5px solid rgba(201,168,76,0.25)",borderRadius:14,padding:"14px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:36,height:36,borderRadius:10,background:"rgba(201,168,76,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>✏</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:600,color:"var(--ink)",marginBottom:2}}>This trip is a draft</div>
          <div style={{fontSize:12,color:"var(--slate)"}}>No dates confirmed yet. Add dates and start booking to mark it active.</div>
        </div>
        <button onClick={()=>setTripStatus("active")} style={{padding:"7px 16px",borderRadius:100,background:"var(--terra)",color:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer",flexShrink:0}}>Mark active →</button>
      </div>
    )}
    {tripStatus==="past" && !reflected && (
      <div className="reflect-banner" style={{marginBottom:20}}>
        <div style={{width:40,height:40,borderRadius:10,background:"rgba(201,168,76,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🌄</div>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#fff",marginBottom:1}}>This trip is over — close the loop</div><div style={{fontSize:11,color:"var(--slate)"}}>Reflect, rank, share photos, and help future travelers</div></div>
        <button className="reflect-cta" onClick={()=>setShowReflect(true)}>Reflect →</button>
      </div>
    )}
    {tripStatus==="past" && reflected && (
      <div style={{background:"linear-gradient(135deg,var(--ocean),var(--tide))",borderRadius:14,padding:"12px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:12,border:"1px solid rgba(201,168,76,0.2)"}}>
        <span>✓</span>
        <span style={{color:"rgba(255,255,255,0.85)",fontSize:13,flex:1}}>Reflection saved — <em style={{color:"var(--gold-lt)"}}>&ldquo;{reflected.title||"Sicily Trip"}&rdquo;</em></span>
        <button onClick={()=>setShowReflect(true)} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.7)",padding:"5px 12px",borderRadius:100,fontSize:11,cursor:"pointer"}}>Edit</button>
      </div>
    )}

    {/* Trip header */}
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
        <div className="pg-eyebrow">My Itineraries · {details.dest}</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {/* Status pill + changer */}
          {!editing && (() => {
            const STATUS_META={
              active: {label:"● Active",   bg:"rgba(74,222,128,0.1)",  border:"rgba(74,222,128,0.3)",  color:"#4ade80",  next:"draft",  nextLabel:"Mark as draft"},
              draft:  {label:"◎ Draft",    bg:"rgba(201,168,76,0.1)",  border:"rgba(201,168,76,0.3)",  color:"var(--gold)", next:"active", nextLabel:"Mark as active"},
              past:   {label:"Past",     bg:"rgba(91,122,142,0.12)", border:"rgba(91,122,142,0.25)", color:"var(--slate)",next:"active", nextLabel:"Reactivate"},
            };
            const m=STATUS_META[tripStatus];
            return (
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:11,fontFamily:"DM Mono,monospace",fontWeight:600,color:m.color,background:m.bg,border:`1px solid ${m.border}`,padding:"4px 12px",borderRadius:100}}>{m.label}</span>
                <div style={{position:"relative"}}>
                  <select value={tripStatus} onChange={e=>setTripStatus(e.target.value)}
                    style={{appearance:"none",background:"none",border:"1.5px solid var(--mist)",borderRadius:100,padding:"4px 24px 4px 10px",fontSize:11,color:"var(--slate)",cursor:"pointer",fontFamily:"DM Sans,sans-serif"}}>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="past">Past</option>
                  </select>
                  <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",fontSize:9,color:"var(--slate)"}}>▾</span>
                </div>
              </div>
            );
          })()}
          {!editing
            ? <button onClick={()=>setEditing(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:100,border:"1.5px solid var(--mist)",background:"none",fontSize:12,color:"var(--slate)",cursor:"pointer"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--terra)";e.currentTarget.style.color="var(--terra)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--mist)";e.currentTarget.style.color="var(--slate)"}}>✏ Edit</button>
            : <div style={{display:"flex",gap:8}}>
                <button onClick={cancelEdit} style={{padding:"6px 14px",borderRadius:100,border:"1.5px solid var(--mist)",background:"none",fontSize:12,color:"var(--slate)",cursor:"pointer"}}>Cancel</button>
                <button onClick={saveDetails} style={{padding:"6px 16px",borderRadius:100,background:"var(--terra)",color:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer"}}>Save</button>
              </div>
          }
        </div>
      </div>

      {!editing ? (
        <>
          <div className="pg-title">{details.dest}</div>
          <div style={{fontSize:13,color:"var(--slate)",marginBottom:8}}>{details.dates} · {details.days} days · {details.travelers} travelers · ${details.budget} budget</div>
          {details.theme&&<div style={{fontSize:12,color:"var(--slate)",fontStyle:"italic",marginBottom:12}}>&ldquo;{details.theme}&rdquo;</div>}
          <div className="vibe-grid">{VIBES.map(v=>(<div key={v.id} className={`vibe-chip ${selVibes.includes(v.id)?"on":""}`} onClick={()=>toggleVibe(v.id)}><div className="chip-dot"/>{v.icon} {v.label}</div>))}</div>
        </>
      ) : (
        <div style={{background:"#fff",borderRadius:16,border:"1.5px solid var(--terra)",padding:20,marginTop:8}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div style={{gridColumn:"1/-1"}}><label className="form-label">Destination</label><DestinationInput value={draftDetails.dest} onChange={v=>setDraftDetails(p=>({...p,dest:v}))}/></div>
            <div><label className="form-label">Dates</label><input className="form-inp" value={draftDetails.dates} onChange={e=>setDraftDetails(p=>({...p,dates:e.target.value}))}/></div>
            <div><label className="form-label">Days</label><input className="form-inp" value={draftDetails.days} onChange={e=>setDraftDetails(p=>({...p,days:e.target.value}))}/></div>
            <div><label className="form-label">Travelers <span style={{color:"var(--terra)",fontFamily:"normal",textTransform:"none",letterSpacing:0,fontSize:11}}>(incl. yourself)</span></label><input className="form-inp" value={draftDetails.travelers} onChange={e=>setDraftDetails(p=>({...p,travelers:e.target.value}))}/></div>
            <div><label className="form-label">Budget ($)</label><input className="form-inp" value={draftDetails.budget} onChange={e=>setDraftDetails(p=>({...p,budget:e.target.value}))}/></div>
            <div style={{gridColumn:"1/-1"}}><label className="form-label">Theme</label><input className="form-inp" value={draftDetails.theme} onChange={e=>setDraftDetails(p=>({...p,theme:e.target.value}))}/></div>
          </div>
          <div><label className="form-label">Vibes</label><div className="vibe-grid" style={{marginTop:8}}>{VIBES.map(v=>(<div key={v.id} className={`vibe-chip ${selVibes.includes(v.id)?"on":""}`} onClick={()=>toggleVibe(v.id)}><div className="chip-dot"/>{v.icon} {v.label}</div>))}</div></div>
        </div>
      )}
    </div>

    {/* ── 5 Main tabs ── */}
    <div style={{display:"flex",gap:0,borderBottom:"2px solid var(--mist)",marginBottom:28}}>
      {MAIN_TABS.map(t=>(
        <button key={t.id} onClick={()=>setMainTab(t.id)}
          style={{display:"flex",alignItems:"center",gap:6,padding:"10px 18px",fontSize:13,fontWeight:mainTab===t.id?600:400,cursor:"pointer",border:"none",background:"none",color:mainTab===t.id?"var(--terra)":"var(--slate)",borderBottom:`2px solid ${mainTab===t.id?"var(--terra)":"transparent"}`,marginBottom:-2,transition:"all 0.15s",whiteSpace:"nowrap"}}>
          <span>{t.icon}</span>
          {t.label}
          {t.badge!=null&&<span style={{background:mainTab===t.id?"var(--terra)":"rgba(91,122,142,0.15)",color:mainTab===t.id?"#fff":"var(--slate)",borderRadius:100,minWidth:18,height:18,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9,fontFamily:"DM Mono,monospace",fontWeight:700,padding:"0 5px"}}>{t.badge}</span>}
        </button>
      ))}
    </div>

    {/* ── Tab: Itinerary ── */}
    {mainTab==="itinerary" && (
      <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:24}}>
        <div className="days-col">
          {DAYS_SICILY.map((day,i)=>{
            const dayBlocks=blocks[i]||[];
            const stayBlock=dayBlocks.find(b=>b.type==="stay");
            return (
              <div key={i} className="iday">
                <div className="iday-hd" onClick={()=>setExp(p=>({...p,[i]:!p[i]}))}>
                  <div style={{display:"flex",alignItems:"center",gap:14}}>
                    <div className="iday-badge">{day.day}</div>
                    <div>
                      <div className="iday-name">{day.name}</div>
                      <div className="iday-sub">{day.date} · {day.theme}{stayBlock&&<span style={{marginLeft:8,color:"var(--ocean)",fontWeight:500}}>🏨 {stayBlock.title}</span>}</div>
                    </div>
                  </div>
                  <span style={{color:"var(--terra)",fontSize:18}}>{exp[i]?"−":"+"}</span>
                </div>
                {exp[i]&&<div className="iday-body">
                  <PhotoStrip photos={day.photos}/>
                  {SLOTS.map(([slot,slotLabel])=>{
                    const slotBlocks=dayBlocks.filter(b=>b.slot===slot);
                    return <TimeSlotGroup key={slot} slot={slot} label={slotLabel} blocks={slotBlocks} onEdit={b=>handleEditBlock(i,b)} onDelete={id=>handleDeleteBlock(i,id)} travelers={travelers}/>;
                  })}
                  {dayBlocks.filter(b=>!b.slot||b.slot==="unscheduled").length>0&&<TimeSlotGroup slot="unscheduled" label="Unscheduled" blocks={dayBlocks.filter(b=>!b.slot||b.slot==="unscheduled")} onEdit={b=>handleEditBlock(i,b)} onDelete={id=>handleDeleteBlock(i,id)} travelers={travelers}/>}
                  <button className="add-row" onClick={()=>setTypePicker(i)}>+ Add accommodation, activity, restaurant, or note</button>
                </div>}
              </div>
            );
          })}
        </div>
        {/* Suggestions sidebar */}
        <div style={{position:"sticky",top:14}}>
          <div style={{fontFamily:"DM Mono,monospace",fontSize:9,color:"var(--slate)",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Suggested for {details.dest.split(",")[0]}</div>
          {SUGGESTED_PLACES.slice(0,5).map((s,i)=>(
            <div key={i} className="sugg-card">
              <div className="sugg-ico" style={{background:s.bg}}>{s.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:500,color:"var(--ink)",marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>
                <div style={{fontSize:10,color:"var(--slate)"}}>{s.note}</div>
                <div style={{display:"flex",gap:6,marginTop:4}}>
                  <span className={`sugg-type ${s.type}`}>{s.type}</span>
                  <span style={{fontSize:10,color:"var(--gold)"}}>★ {s.rating}</span>
                </div>
              </div>
              <button style={{flexShrink:0,background:"none",border:"1.5px solid var(--mist)",borderRadius:8,padding:"4px 8px",fontSize:11,color:"var(--slate)",cursor:"pointer"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--terra)";e.currentTarget.style.color="var(--terra)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--mist)";e.currentTarget.style.color="var(--slate)"}}>+ Add</button>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* ── Tab: Map View ── */}
    {mainTab==="map" && <TripMapView/>}

    {/* ── Tab: To Do ── */}
    {mainTab==="todo" && (
      <div style={{maxWidth:640}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>Smart To Do</div>
          <span style={{fontFamily:"DM Mono,monospace",fontSize:11,color:donePct===100?"var(--green)":"var(--terra)"}}>{donePct}% complete</span>
        </div>
        <div className="progress-bar" style={{marginBottom:20}}><div className="progress-fill" style={{width:`${donePct}%`}}/></div>
        {["high","medium","low"].map(priority=>{
          const items=todos.filter(t=>t.priority===priority);
          if(!items.length) return null;
          const label={high:"Must do before you go",medium:"Should do",low:"Nice to have"}[priority];
          return <div key={priority} style={{marginBottom:20}}>
            <div style={{fontFamily:"DM Mono,monospace",fontSize:9,color:"var(--slate)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:8,paddingBottom:6,borderBottom:"1px solid var(--mist)"}}>{label}</div>
            {items.map(item=>(
              <div key={item.id} className="ck-row">
                <div className={`ck-box ${item.done?"done":""}`} onClick={()=>setTodos(p=>p.map(t=>t.id===item.id?{...t,done:!t.done}:t))}>{item.done&&"✓"}</div>
                <div className={`ck-label ${item.done?"done":""}`}>{item.task}</div>
                <span className="ck-cat" style={{color:catColors[item.cat]||"var(--slate)"}}>{item.cat}</span>
              </div>
            ))}
          </div>;
        })}
      </div>
    )}

    {/* ── Tab: Budget ── */}
    {mainTab==="budget" && (
      <div style={{maxWidth:600}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>Budget Tracker</div>
          <div style={{fontFamily:"DM Mono,monospace",fontSize:11,color:"var(--slate)",background:"var(--foam)",border:"1.5px solid var(--mist)",borderRadius:100,padding:"5px 14px"}}>{travelers} traveler{travelers>1?"s":""}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24}}>
          <div style={{background:"var(--foam)",borderRadius:14,padding:18,border:"1.5px solid var(--mist)"}}>
            <div style={{fontSize:11,color:"var(--slate)",marginBottom:4}}>Total spent</div>
            <div style={{fontFamily:"DM Mono,monospace",fontSize:26,fontWeight:500,color:"var(--ink)"}}>${totalSpent.toLocaleString()}</div>
            {travelers>1&&<div style={{fontSize:11,color:"var(--slate)",marginTop:5,fontFamily:"DM Mono,monospace"}}>${Math.round(totalSpent/travelers).toLocaleString()} / person</div>}
          </div>
          <div style={{background:"var(--foam)",borderRadius:14,padding:18,border:"1.5px solid var(--mist)"}}>
            <div style={{fontSize:11,color:"var(--slate)",marginBottom:4}}>Total budget</div>
            <div style={{fontFamily:"DM Mono,monospace",fontSize:26,fontWeight:500,color:"var(--ocean)"}}>${totalBudget.toLocaleString()}</div>
            {travelers>1&&<div style={{fontSize:11,color:"var(--slate)",marginTop:5,fontFamily:"DM Mono,monospace"}}>${Math.round(totalBudget/travelers).toLocaleString()} / person</div>}
          </div>
        </div>
        {BUDGET_ITEMS.map((b,i)=>{
          const over=b.spent>b.budget;
          return <div key={i} style={{marginBottom:14,background:"#fff",borderRadius:12,padding:14,border:"1.5px solid var(--mist)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:14,fontWeight:500,color:"var(--ink)",display:"flex",gap:8,alignItems:"center"}}><span>{b.icon}</span>{b.label}</span>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"DM Mono,monospace",color:over?"var(--red)":"var(--slate)",fontSize:11}}>${b.spent.toLocaleString()} <span style={{color:"var(--mist)"}}>/ ${b.budget.toLocaleString()}</span></div>
                {travelers>1&&<div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"var(--slate)",marginTop:2}}>${Math.round(b.spent/travelers).toLocaleString()} / ${Math.round(b.budget/travelers).toLocaleString()} pp</div>}
              </div>
            </div>
            <div className="bbar" style={{height:8}}><div className="bbar-fill" style={{width:`${Math.min((b.spent/b.budget)*100,100)}%`,background:over?"var(--red)":"var(--terra)"}}/></div>
            {over&&<div style={{fontSize:10,color:"var(--red)",marginTop:5,fontFamily:"DM Mono,monospace"}}>${(b.spent-b.budget).toLocaleString()} over budget</div>}
          </div>;
        })}
        <div style={{padding:"12px 16px",borderRadius:12,background:"rgba(201,168,76,0.08)",border:"1px solid rgba(201,168,76,0.2)",fontSize:13,color:"var(--slate)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>${(totalBudget-totalSpent).toLocaleString()} remaining</span>
          {travelers>1&&<span style={{fontFamily:"DM Mono,monospace",fontSize:11}}>${Math.round((totalBudget-totalSpent)/travelers).toLocaleString()} / person</span>}
        </div>
      </div>
    )}

    {/* ── Tab: Research ── */}
    {mainTab==="research" && (
      <div style={{maxWidth:680}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"var(--ink)",marginBottom:4}}>Trip Intelligence</div>
        <div style={{fontSize:13,color:"var(--slate)",marginBottom:20}}>Synthesized from 1,060+ real traveler reviews for {details.dest}</div>
        <div style={{display:"flex",flexDirection:"column",gap:0,background:"#fff",borderRadius:16,border:"1.5px solid var(--mist)",overflow:"hidden",marginBottom:20}}>
          {INSIGHTS_SICILY.map((ins,i)=>(
            <div key={i} style={{display:"flex",gap:14,padding:"16px 20px",borderBottom:i<INSIGHTS_SICILY.length-1?"1px solid var(--mist)":"none",alignItems:"flex-start"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:ins.c,marginTop:6,flexShrink:0}}/>
              <div style={{flex:1}}><div style={{fontSize:13,color:"var(--ink)",lineHeight:1.7}}>{ins.t}</div><div style={{fontFamily:"DM Mono,monospace",fontSize:10,color:"var(--slate)",marginTop:4}}>{ins.src}</div></div>
            </div>
          ))}
        </div>
        <div style={{padding:20,background:"linear-gradient(135deg,var(--ocean),var(--tide))",borderRadius:16,border:"1px solid rgba(201,168,76,0.2)"}}>
          <div style={{fontSize:13,fontWeight:600,color:"var(--gold-lt)",marginBottom:6}}>✦ AI-powered insights coming soon</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.7}}>Connect Anthropic API to enable real-time synthesis of thousands of TripAdvisor, Reddit, and GetYourGuide reviews — surfacing the patterns that matter for your exact trip.</div>
        </div>
      </div>
    )}

    {/* ── Tab: Saved ── */}
    {mainTab==="saved" && (
      <div style={{maxWidth:680}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>Saved clips & links</div>
          {savedItems.length>0&&<span className="saved-count-badge">{savedItems.length} saved</span>}
        </div>
        <div style={{fontSize:13,color:"var(--slate)",marginBottom:20}}>
          TikToks, Instagram reels, YouTube videos, Maps pins — saved here and ready to add to a day.
        </div>
        {savedItems.length===0 ? (
          <div style={{textAlign:"center",padding:"56px 24px",background:"#fff",borderRadius:16,border:"1.5px dashed var(--mist)"}}>
            <div style={{fontSize:40,marginBottom:12}}>↗</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:"var(--ink)",marginBottom:6}}>Nothing saved yet</div>
            <div style={{fontSize:13,color:"var(--slate)"}}>Paste a link in the bar at the top of the page to save it here.</div>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {savedItems.map(item=>(
              <LinkPreviewCard key={item.id} item={item} compact/>
            ))}
          </div>
        )}
        <div style={{marginTop:16,padding:"14px 18px",background:"var(--foam)",borderRadius:12,border:"1.5px dashed var(--mist)",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}
          onClick={()=>document.querySelector(".save-input")?.focus()}>
          <span style={{fontSize:20}}>↗</span>
          <div style={{fontSize:13,color:"var(--slate)"}}>Paste a TikTok, Instagram, YouTube, or Maps link above to add it here</div>
          <span style={{marginLeft:"auto",fontSize:12,color:"var(--terra)",fontWeight:500,whiteSpace:"nowrap"}}>↑ Paste above</span>
        </div>
      </div>
    )}

    {typePicker!==null&&<TypePicker onSelect={bt=>handleTypeSelect(bt,typePicker)} onClose={()=>setTypePicker(null)} onHotelCompare={()=>{setHotelModal(typePicker);setTypePicker(null);}}/>}
    {actModal!==null&&<ActivityModal day={DAYS_SICILY[actModal]?.day} dest={details.dest} onClose={()=>setActModal(null)} onAdd={(tour,an)=>handleAddTour(tour,an,actModal)}/>}
    {hotelModal!==null&&<HotelCompareModal onClose={()=>setHotelModal(null)} onAdd={handleAddHotel}/>}
    {showReflect&&<ReflectModal dest="Sicily, Italy" onClose={()=>setShowReflect(false)} onSave={d=>{setReflected(d);setShowReflect(false);}}/>}
  </>;
}

/* ═══════════ NEW TRIP BUILDER ═══════════════════════════════════ */
function NewTripBuilder() {
  const [step,setStep]=useState(0);
  const [form,setForm]=useState({dest:"",days:"3",budget:"",theme:"",travelers:""});
  const [selVibes,setSelVibes]=useState([]);
  const [customVibeInput,setCustomVibeInput]=useState("");
  const [showCustomInput,setShowCustomInput]=useState(false);
  const [customVibes,setCustomVibes]=useState([]);
  const [days]=useState([{id:0,day:"Day 1",name:"Day 1",date:"",theme:""},{id:1,day:"Day 2",name:"Day 2",date:"",theme:""},{id:2,day:"Day 3",name:"Day 3",date:"",theme:""}]);
  const [blocks,setBlocks]=useState({});
  const [exps,setExps]=useState({0:true});
  const [typePicker,setTypePicker]=useState(null);
  const [actModal,setActModal]=useState(null);
  const [hotelModal,setHotelModal]=useState(null);
  const [editingDetails,setEditingDetails]=useState(false);
  const [draftForm,setDraftForm]=useState({...form});
  const [draftVibes,setDraftVibes]=useState([...selVibes]);

  const allVibes=[...VIBES,...customVibes];
  const toggleVibe=id=>setSelVibes(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const toggleDraftVibe=id=>setDraftVibes(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const addCustomVibe=()=>{if(!customVibeInput.trim())return;const id="custom_"+Date.now();setCustomVibes(p=>[...p,{id,label:customVibeInput.trim(),icon:"LUX"}]);setSelVibes(p=>[...p,id]);setCustomVibeInput("");setShowCustomInput(false);};

  const openEdit=()=>{setDraftForm({...form});setDraftVibes([...selVibes]);setEditingDetails(true);};
  const saveEdit=()=>{setForm({...draftForm});setSelVibes([...draftVibes]);setEditingDetails(false);};
  const cancelEdit=()=>setEditingDetails(false);

  const handleTypeSelect=(bt,dayId)=>{
    setTypePicker(null);
    if(bt.id==="activity"){setActModal(dayId);return;}
    setBlocks(p=>({...p,[dayId]:[...(p[dayId]||[]),{id:Date.now(),...bt,title:`New ${bt.label}`,detail:"Tap to add details",price:"",status:"pending",time:"",slot:"morning",cancelTiers:null,conf:null}]}));
  };
  const handleAddTour=(tour,actName,dayId)=>{setActModal(null);setBlocks(p=>({...p,[dayId]:[...(p[dayId]||[]),{id:Date.now(),type:"activity",ico:"🏔",bg:"#EEF0FA",title:actName,detail:`${tour.company} · ${tour.duration}`,price:`$${tour.price}`,status:"pending",time:"",slot:"morning",cancelTiers:null,conf:null}]}));};
  const handleAddHotel=(hotel)=>{const dayId=hotelModal;setHotelModal(null);setBlocks(p=>({...p,[dayId]:[...(p[dayId]||[]),{id:Date.now(),type:"stay",ico:"HTL",bg:"#E3EEF5",title:hotel.name,detail:`${hotel.location} · ★${hotel.rating}`,price:`$${hotel.price}/nt`,status:"pending",time:"3:00 PM",slot:"afternoon",cancelTiers:[{days:7,pct:100},{days:0,pct:0}],conf:null}]}));};

  const handleEditBlock=(dayId,updated)=>setBlocks(p=>({...p,[dayId]:p[dayId].map(b=>b.id===updated.id?updated:b)}));
  const handleDeleteBlock=(dayId,id)=>{if(window.confirm("Remove this block?")){setBlocks(p=>({...p,[dayId]:p[dayId].filter(b=>b.id!==id)}));}};

  if(step===0) return <>
    <div style={{marginBottom:28}}><div className="pg-eyebrow">My Itineraries · New Trip</div><div className="pg-title">Plan a new trip</div><div style={{fontSize:14,color:"var(--slate)"}}>Tell us the basics. We'll structure everything else.</div></div>
    <div className="setup-card">
      <div className="form-grid2">
        <div style={{gridColumn:"1/-1"}}>
          <label className="form-label">Destination <span style={{color:"var(--terra)",fontFamily:"normal",textTransform:"none",letterSpacing:0,fontSize:11}}>city / country</span></label>
          <DestinationInput value={form.dest} onChange={v=>setForm(p=>({...p,dest:v}))}/>
        </div>
        <div><label className="form-label">Number of days</label><input className="form-inp" placeholder="e.g. 5" value={form.days} onChange={e=>setForm(p=>({...p,days:e.target.value}))}/></div>
        <div><label className="form-label">Total budget ($)</label><input className="form-inp" placeholder="e.g. 2000" value={form.budget} onChange={e=>setForm(p=>({...p,budget:e.target.value}))}/></div>
        <div style={{gridColumn:"1/-1"}}>
          <label className="form-label">Total travelers <span style={{color:"var(--terra)",fontFamily:"normal",textTransform:"none",letterSpacing:0,fontSize:11}}>(including yourself)</span></label>
          <input className="form-inp" placeholder="e.g. 2" value={form.travelers} onChange={e=>setForm(p=>({...p,travelers:e.target.value}))}/>
        </div>
      </div>
      <div style={{marginBottom:20}}>
        <label className="form-label">Trip vibes <span style={{color:"var(--terra)",fontFamily:"normal",textTransform:"none",letterSpacing:0,fontSize:11}}>(select all that apply)</span></label>
        <div className="vibe-grid" style={{marginTop:8}}>
          {allVibes.map(v=>(<div key={v.id} className={`vibe-chip ${selVibes.includes(v.id)?"on":""}`} onClick={()=>toggleVibe(v.id)}><div className="chip-dot"/>{v.icon} {v.label}</div>))}
          {showCustomInput?(
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <input autoFocus className="form-inp" style={{padding:"8px 12px",fontSize:13,width:160,borderRadius:100}} placeholder="Your vibe..." value={customVibeInput} onChange={e=>setCustomVibeInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")addCustomVibe();if(e.key==="Escape"){setShowCustomInput(false);setCustomVibeInput("");}}}/>
              <button onClick={addCustomVibe} style={{padding:"8px 14px",borderRadius:100,background:"var(--ocean)",color:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer"}}>Add</button>
              <button onClick={()=>{setShowCustomInput(false);setCustomVibeInput("");}} style={{padding:"8px 14px",borderRadius:100,background:"none",border:"1.5px solid var(--mist)",color:"var(--slate)",fontSize:12,cursor:"pointer"}}>×</button>
            </div>
          ):(
            <div className="vibe-chip" style={{borderStyle:"dashed",cursor:"pointer"}} onClick={()=>setShowCustomInput(true)}><span style={{fontSize:16}}>+</span> Add your own</div>
          )}
        </div>
      </div>
      <div style={{marginBottom:28}}><label className="form-label">Trip theme / goal</label><input className="form-inp" placeholder="e.g. Celebrate anniversary, explore ancient history" value={form.theme} onChange={e=>setForm(p=>({...p,theme:e.target.value}))}/></div>
      <button onClick={()=>setStep(1)} style={{background:"var(--terra)",color:"#fff",border:"none",padding:"14px 32px",borderRadius:100,fontSize:15,fontWeight:600,cursor:"pointer"}}>Build my itinerary →</button>
    </div>
  </>;

  const travelers=parseInt(form.travelers)||1;
  const SLOTS=[["morning","Morning"],["afternoon","Afternoon"],["evening","Evening"]];

  return <>
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
          <div style={{fontSize:13,color:"var(--slate)",fontFamily:"DM Mono,monospace",marginBottom:form.theme?6:14}}>{form.days} days · {form.travelers||"?"} travelers{form.budget?` · $${form.budget} budget`:""}</div>
          {form.theme&&<div style={{fontSize:13,color:"var(--slate)",fontStyle:"italic",marginBottom:14}}>&ldquo;{form.theme}&rdquo;</div>}
          <div className="vibe-grid">
            {selVibes.length>0
              ? selVibes.map(id=>{const v=allVibes.find(x=>x.id===id);return v?(<div key={id} className="vibe-chip on"><div className="chip-dot"/>{v.icon} {v.label}</div>):null;})
              : <span style={{fontSize:13,color:"var(--slate)"}}>No vibes selected</span>
            }
          </div>
        </>
      ) : (
        <div style={{background:"#fff",borderRadius:16,border:"1.5px solid var(--terra)",padding:24,marginTop:8}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:"var(--ink)",marginBottom:16}}>Edit Trip Details</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
            <div style={{gridColumn:"1/-1"}}><label className="form-label">Destination</label><DestinationInput value={draftForm.dest} onChange={v=>setDraftForm(p=>({...p,dest:v}))} /></div>
            <div><label className="form-label">Number of days</label><input className="form-inp" value={draftForm.days} onChange={e=>setDraftForm(p=>({...p,days:e.target.value}))}/></div>
            <div><label className="form-label">Total budget ($)</label><input className="form-inp" value={draftForm.budget} onChange={e=>setDraftForm(p=>({...p,budget:e.target.value}))}/></div>
            <div style={{gridColumn:"1/-1"}}><label className="form-label">Total travelers <span style={{color:"var(--terra)",fontFamily:"normal",textTransform:"none",letterSpacing:0,fontSize:11}}>(including yourself)</span></label><input className="form-inp" value={draftForm.travelers} onChange={e=>setDraftForm(p=>({...p,travelers:e.target.value}))}/></div>
            <div style={{gridColumn:"1/-1"}}><label className="form-label">Trip theme</label><input className="form-inp" value={draftForm.theme} onChange={e=>setDraftForm(p=>({...p,theme:e.target.value}))}/></div>
          </div>
          <div><label className="form-label">Trip vibes</label><div className="vibe-grid" style={{marginTop:8}}>{allVibes.map(v=>(<div key={v.id} className={`vibe-chip ${draftVibes.includes(v.id)?"on":""}`} onClick={()=>toggleDraftVibe(v.id)}><div className="chip-dot"/>{v.icon} {v.label}</div>))}</div></div>
        </div>
      )}
    </div>
    <div style={{background:"var(--ocean)",borderRadius:14,padding:"13px 20px",display:"flex",alignItems:"center",gap:12,marginBottom:24,border:"1px solid rgba(201,168,76,0.15)"}}>
      <span style={{fontSize:16,color:"var(--gold)"}}>◆</span>
      <div><div style={{fontSize:13,fontWeight:600,color:"#fff"}}>Trip Intelligence active for {form.dest||"your destination"}</div><div style={{fontSize:11,color:"var(--slate)"}}>Real data from 3,200+ reviews · GetYourGuide, Viator, TripAdvisor</div></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:24}}>
      <div>
        <div className="days-col">
          {days.map(day=>(
            <div key={day.id} className="iday">
              <div className="iday-hd" onClick={()=>setExps(p=>({...p,[day.id]:!p[day.id]}))}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div className="iday-badge">{day.day}</div>
                  <div>
                    <div className="iday-name">{day.name}</div>
                    {(blocks[day.id]||[]).find(b=>b.type==="stay")&&<div className="iday-sub">{(blocks[day.id]||[]).find(b=>b.type==="stay").title}</div>}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:11,color:"var(--terra)",fontFamily:"DM Mono,monospace"}}>{(blocks[day.id]||[]).length} items</span>
                  <span style={{color:"var(--terra)",fontSize:18}}>{exps[day.id]?"−":"+"}</span>
                </div>
              </div>
              {exps[day.id]&&<div className="iday-body">
                <PhotoStrip photos={[]}/>
                {SLOTS.map(([slot,slotLabel])=>{
                  const slotBlocks=(blocks[day.id]||[]).filter(b=>b.slot===slot);
                  return <TimeSlotGroup key={slot} slot={slot} label={slotLabel} blocks={slotBlocks} onEdit={b=>handleEditBlock(day.id,b)} onDelete={id=>handleDeleteBlock(day.id,id)} travelers={travelers}/>;
                })}
                {(blocks[day.id]||[]).filter(b=>!b.slot||b.slot==="unscheduled").length>0&&<TimeSlotGroup slot="unscheduled" label="Unscheduled" blocks={(blocks[day.id]||[]).filter(b=>!b.slot||b.slot==="unscheduled")} onEdit={b=>handleEditBlock(day.id,b)} onDelete={id=>handleDeleteBlock(day.id,id)} travelers={travelers}/>}
                {(blocks[day.id]||[]).length===0&&<div style={{padding:14,borderRadius:12,border:"1.5px dashed var(--mist)",textAlign:"center",color:"var(--slate)",fontSize:13}}>Nothing added yet</div>}
                <button className="add-row" onClick={()=>setTypePicker(day.id)}>+ Add accommodation, activity, restaurant, or note</button>
              </div>}
            </div>
          ))}
        </div>
      </div>
      <SmartPanels dest={form.dest||"your destination"} travelers={travelers} budget={parseFloat(form.budget)||0}/>
    </div>
    {typePicker!==null&&<TypePicker onSelect={bt=>handleTypeSelect(bt,typePicker)} onClose={()=>setTypePicker(null)} onHotelCompare={()=>{setHotelModal(typePicker);setTypePicker(null);}}/>}
    {actModal!==null&&<ActivityModal day={days.find(d=>d.id===actModal)?.day} dest={form.dest||"your destination"} onClose={()=>setActModal(null)} onAdd={(tour,an)=>handleAddTour(tour,an,actModal)}/>}
    {hotelModal!==null&&<HotelCompareModal onClose={()=>setHotelModal(null)} onAdd={handleAddHotel}/>}
  </>;
}

/* ═══════════ DISCOVER MAP ═══════════════════════════════════════ */
// Pins: x/y as % of 1000×500 viewBox (equirectangular projection)
const WORLD_PINS = [
  {id:"sicily",   flag:"IT", name:"Sicily",       country:"Italy",       x:52.2,y:36.5, trips:14, tags:["Cultural","Foodie"],   color:"#C4603A", hot:true},
  {id:"kyoto",    flag:"JP", name:"Kyoto",        country:"Japan",       x:78.5,y:35.0, trips:22, tags:["Cultural","Zen"],      color:"#9D7BE5"},
  {id:"lisbon",   flag:"PT", name:"Lisbon",       country:"Portugal",    x:45.8,y:34.0, trips:18, tags:["Foodie","Romantic"],   color:"#6B9FD4"},
  {id:"marrakech",flag:"MA", name:"Marrakech",    country:"Morocco",     x:47.5,y:38.5, trips:11, tags:["Cultural","Budget"],   color:"#C9A84C"},
  {id:"bali",     flag:"ID", name:"Bali",         country:"Indonesia",   x:78.0,y:52.5, trips:31, tags:["Beach","Foodie"],      color:"#5BAD7A", hot:true},
  {id:"oaxaca",   flag:"MX", name:"Oaxaca",       country:"Mexico",      x:22.0,y:40.5, trips:9,  tags:["Foodie","Budget"],     color:"#C4603A"},
  {id:"athens",   flag:"GR", name:"Athens",       country:"Greece",      x:53.8,y:34.5, trips:16, tags:["Historical","Luxury"], color:"#6B9FD4"},
  {id:"nairobi",  flag:"KE", name:"Nairobi",      country:"Kenya",       x:55.5,y:52.0, trips:7,  tags:["Safari","Adventure"],  color:"#5BAD7A"},
  {id:"queenstown",flag:"NZ",name:"Queenstown",   country:"New Zealand", x:86.5,y:72.0, trips:12, tags:["Adventure","Hiking"],  color:"#C9A84C"},
  {id:"patagonia",flag:"AR", name:"Patagonia",    country:"Argentina",   x:29.5,y:76.0, trips:6,  tags:["Hiking","Adventure"],  color:"#5BAD7A"},
  {id:"tokyo",    flag:"JP", name:"Tokyo",        country:"Japan",       x:79.8,y:32.5, trips:28, tags:["Foodie","Cultural"],   color:"#9D7BE5", hot:true},
  {id:"istanbul", flag:"TR", name:"Istanbul",     country:"Turkey",      x:55.5,y:32.0, trips:19, tags:["Cultural","Foodie"],   color:"#C4603A"},
  {id:"capetown", flag:"ZA", name:"Cape Town",    country:"South Africa",x:52.0,y:67.0, trips:10, tags:["Adventure","Beach"],   color:"#6B9FD4"},
  {id:"havana",   flag:"CU", name:"Havana",       country:"Cuba",        x:24.5,y:40.0, trips:8,  tags:["Cultural","Romantic"], color:"#C9A84C"},
  {id:"santorini",flag:"GR", name:"Santorini",    country:"Greece",      x:54.2,y:35.5, trips:20, tags:["Romantic","Luxury"],   color:"#9D7BE5"},
];

function DiscoverMap() {
  const [hovered, setHovered] = useState(null);
  const [active,  setActive]  = useState(null);
  const [tooltip, setTooltip] = useState({x:0,y:0});
  const wrapRef = useRef(null);

  const handlePinEnter = (pin, e) => {
    setHovered(pin.id);
    const rect = wrapRef.current.getBoundingClientRect();
    setTooltip({x: e.clientX - rect.left, y: e.clientY - rect.top});
  };
  const handlePinMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    setTooltip({x: e.clientX - rect.left, y: e.clientY - rect.top});
  };
  const handlePinLeave = () => setHovered(null);
  const handlePinClick = (pin) => setActive(a => a === pin.id ? null : pin.id);

  const hovPin = WORLD_PINS.find(p => p.id === hovered);
  const actPin = WORLD_PINS.find(p => p.id === active);
  const displayPin = hovPin || actPin;

  // Simple equirectangular land masses as SVG paths (1000×500 viewBox)
  const LANDS = [
    // North America
    "M 155,60 L 175,55 L 210,58 L 235,65 L 255,60 L 270,65 L 265,80 L 250,95 L 240,115 L 235,135 L 225,145 L 215,155 L 205,150 L 195,140 L 185,130 L 175,125 L 165,120 L 158,110 L 150,95 L 148,80 Z",
    // Greenland
    "M 220,20 L 240,15 L 260,18 L 270,28 L 265,40 L 250,45 L 230,42 L 218,32 Z",
    // Central America
    "M 215,155 L 225,158 L 228,168 L 222,175 L 215,170 L 210,162 Z",
    // South America
    "M 235,175 L 255,172 L 270,178 L 282,192 L 285,215 L 278,240 L 268,268 L 258,295 L 248,318 L 238,330 L 228,318 L 220,295 L 218,268 L 220,240 L 225,215 L 228,195 Z",
    // Europe
    "M 455,45 L 490,40 L 520,42 L 535,50 L 530,62 L 515,68 L 500,72 L 485,70 L 470,65 L 458,58 Z",
    // Scandinavia
    "M 480,25 L 500,20 L 515,28 L 510,40 L 495,42 L 482,38 Z",
    // UK
    "M 458,42 L 468,38 L 472,45 L 465,52 L 456,48 Z",
    // Africa
    "M 470,155 L 500,148 L 535,152 L 555,165 L 562,185 L 558,210 L 548,235 L 535,262 L 520,288 L 505,305 L 490,308 L 475,295 L 462,268 L 455,240 L 452,215 L 455,188 L 462,170 Z",
    // Middle East
    "M 545,120 L 580,115 L 598,125 L 595,140 L 578,148 L 558,145 L 545,135 Z",
    // Russia/Central Asia
    "M 525,28 L 600,22 L 680,25 L 740,30 L 760,40 L 745,55 L 710,60 L 670,58 L 630,55 L 590,52 L 555,50 L 530,45 Z",
    // South Asia
    "M 610,120 L 645,112 L 665,118 L 672,132 L 665,148 L 648,158 L 630,155 L 615,145 L 608,132 Z",
    // Southeast Asia
    "M 720,125 L 755,118 L 775,125 L 778,138 L 765,148 L 745,150 L 728,142 L 718,132 Z",
    // China/East Asia
    "M 680,60 L 730,55 L 775,60 L 800,72 L 798,90 L 782,102 L 755,108 L 725,105 L 700,98 L 682,85 Z",
    // Japan
    "M 800,68 L 810,62 L 818,68 L 815,78 L 805,80 L 798,74 Z",
    // Australia
    "M 755,285 L 800,278 L 840,282 L 862,295 L 868,315 L 858,335 L 835,348 L 805,352 L 775,345 L 755,328 L 748,308 Z",
    // New Zealand
    "M 868,328 L 878,322 L 885,330 L 882,342 L 872,345 L 865,338 Z",
  ];

  return (
    <div className="dmap-wrap" ref={wrapRef}>
      <div className="dmap-header">
        <div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:"#fff",lineHeight:1}}>Explore the World</div>
          <div style={{fontSize:10,color:"var(--slate)",fontFamily:"DM Mono,monospace",marginTop:3,letterSpacing:0.5}}>
            {WORLD_PINS.length} destinations · {WORLD_PINS.reduce((s,p)=>s+p.trips,0)} community trips
          </div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"rgba(255,255,255,0.35)",fontFamily:"DM Mono,monospace"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:"var(--terra)",boxShadow:"0 0 6px var(--terra)"}}/>
            Hot destination
          </div>
          {active && (
            <button onClick={()=>setActive(null)}
              style={{fontSize:9,fontFamily:"DM Mono,monospace",color:"var(--slate)",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:100,padding:"3px 10px",cursor:"pointer"}}>
              ✕ clear
            </button>
          )}
        </div>
      </div>

      <svg viewBox="0 0 1000 500" className="dmap-svg" style={{height:260}}>
        {/* Ocean */}
        <rect width="1000" height="500" fill="#0b1e2e"/>
        {/* Subtle latitude lines */}
        {[20,35,50,65].map(y=>(
          <line key={y} x1="0" y1={y*5} x2="1000" y2={y*5}
            stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" strokeDasharray="4,6"/>
        ))}
        {/* Land */}
        {LANDS.map((d,i)=>(
          <path key={i} d={d} fill="#1a3a52" stroke="#0f2538" strokeWidth="0.8"/>
        ))}
        {/* Pins */}
        {WORLD_PINS.map(pin => {
          const px = (pin.x / 100) * 1000;
          const py = (pin.y / 100) * 500;
          const isHov = pin.id === hovered;
          const isAct = pin.id === active;
          const r = isHov || isAct ? 9 : 7;
          return (
            <g key={pin.id} className="dmap-pin"
              transform={`translate(${px},${py})`}
              onMouseEnter={e => handlePinEnter(pin, e)}
              onMouseMove={handlePinMove}
              onMouseLeave={handlePinLeave}
              onClick={() => handlePinClick(pin)}
              style={{animation:`pinPop 0.3s ease ${WORLD_PINS.indexOf(pin)*40}ms both`}}
            >
              {/* Pulse ring for hot destinations */}
              {pin.hot && (
                <circle r="13" fill="none" stroke={pin.color} strokeWidth="1.5"
                  style={{animation:"pinPulse 2.2s ease-in-out infinite",transformOrigin:"0px 0px"}}
                />
              )}
              {/* Active ring */}
              {isAct && (
                <circle r="16" fill="none" stroke={pin.color} strokeWidth="2" opacity="0.6"/>
              )}
              {/* Pin circle */}
              <circle r={r} fill={isAct ? pin.color : isHov ? pin.color : `${pin.color}cc`}
                stroke={isHov||isAct ? "#fff" : "rgba(255,255,255,0.3)"}
                strokeWidth={isHov||isAct ? 2 : 1}
                style={{transition:"all 0.18s", filter: isHov||isAct ? `drop-shadow(0 0 6px ${pin.color})` : "none"}}
              />
              {/* Flag emoji */}
              <text x="0" y="1" textAnchor="middle" dominantBaseline="middle"
                fontSize={isHov||isAct ? "9" : "7"} style={{userSelect:"none",pointerEvents:"none",transition:"font-size 0.15s"}}>
                {pin.flag}
              </text>
              {/* Trip count badge for active */}
              {isAct && (
                <g transform="translate(10,-10)">
                  <rect x="-10" y="-7" width="20" height="14" rx="7" fill={pin.color}/>
                  <text x="0" y="1" textAnchor="middle" dominantBaseline="middle"
                    fontSize="7" fill="#fff" fontFamily="DM Mono,monospace" fontWeight="700"
                    style={{userSelect:"none",pointerEvents:"none"}}>
                    {pin.trips}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {displayPin && (
        <div className="dmap-tooltip" style={{
          left: Math.min(tooltip.x + 14, (wrapRef.current?.offsetWidth||600) - 200),
          top: Math.max(tooltip.y - 10, 8),
          opacity: hovPin ? 1 : 0.95,
        }}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:7}}>
            <span style={{fontSize:18}}>{displayPin.flag}</span>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"#fff",lineHeight:1}}>{displayPin.name}</div>
              <div style={{fontSize:9,color:"var(--slate)",fontFamily:"DM Mono,monospace",marginTop:2,letterSpacing:0.5}}>{displayPin.country}</div>
            </div>
            {displayPin.hot && (
              <div style={{marginLeft:"auto",fontSize:8,color:"var(--terra)",background:"rgba(196,96,58,0.15)",border:"1px solid rgba(196,96,58,0.3)",borderRadius:100,padding:"2px 7px",fontFamily:"DM Mono,monospace",whiteSpace:"nowrap"}}>🔥 hot</div>
            )}
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
            {displayPin.tags.map(t=>(
              <span key={t} style={{fontSize:9,padding:"2px 8px",borderRadius:100,background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.55)",fontFamily:"DM Mono,monospace"}}>{t}</span>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontFamily:"DM Mono,monospace"}}>
              <span style={{color:displayPin.color,fontWeight:700}}>{displayPin.trips}</span> community trips
            </div>
            <button style={{fontSize:9,padding:"3px 10px",borderRadius:100,background:`${displayPin.color}22`,border:`1px solid ${displayPin.color}66`,color:displayPin.color,cursor:"pointer",fontFamily:"DM Mono,monospace"}}>
              Explore →
            </button>
          </div>
        </div>
      )}

      {/* Active destination details bar */}
      {actPin && (
        <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",padding:"12px 20px",display:"flex",gap:16,alignItems:"center"}}>
          <span style={{fontSize:24}}>{actPin.flag}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:"#fff"}}>{actPin.name}, {actPin.country}</div>
            <div style={{display:"flex",gap:6,marginTop:4}}>
              {actPin.tags.map(t=>(
                <span key={t} style={{fontSize:9,padding:"2px 8px",borderRadius:100,background:`${actPin.color}20`,color:actPin.color,fontFamily:"DM Mono,monospace",border:`1px solid ${actPin.color}40`}}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:20,fontWeight:700,color:actPin.color,fontFamily:"DM Mono,monospace"}}>{actPin.trips}</div>
            <div style={{fontSize:9,color:"var(--slate)",fontFamily:"DM Mono,monospace"}}>trips planned</div>
          </div>
          <button style={{padding:"8px 18px",borderRadius:100,background:actPin.color,color:"#fff",border:"none",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
            View Trips →
          </button>
        </div>
      )}
    </div>
  );
}


function DiscoverView() {
  const [tab,setTab]=useState("community");
  const [filters,setFilters]=useState([]);
  const toggleFilter=f=>setFilters(p=>p.includes(f)?p.filter(x=>x!==f):[...p,f]);
  const FILTERS=["All","Foodie","Hiking","Cultural","Budget","Luxury","Romantic"];
  return (
    <div>
      <div className="pg-eyebrow">Community</div>
      <div className="pg-title">Discover</div>
      <div style={{fontSize:14,color:"var(--slate)",marginBottom:20}}>Real itineraries from real travelers. Fork any trip in one click.</div>

      {/* ── Interactive world map — always at top ── */}
      <DiscoverMap/>

      <div className="discover-tabs">
        {[["community","Community"],["friends","Friends Feed"]].map(([k,l])=>(
          <button key={k} className={`dtab ${tab===k?"active":""}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>
      {tab==="community"&&<>
        <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
          {FILTERS.map(f=><button key={f} className={`fchip ${filters.includes(f)||f==="All"&&filters.length===0?"active":""}`} onClick={()=>toggleFilter(f)}>{f}</button>)}
        </div>
        <div className="card-grid">
          {COMMUNITY_CARDS.map((c,i)=>(
            <div key={i} className="ccard">
              <div className="ccard-img" style={{position:"relative",overflow:"hidden"}}>
                {c.photo && <img src={c.photo} alt={c.dest} style={{width:"100%",height:"100%",objectFit:"cover",position:"absolute",inset:0}}/>}
                <div className="ccard-img-overlay"/>
                <div className="ccard-img-meta">
                  <div className="ccard-dest">{c.dest}<br/><span style={{fontSize:12,fontWeight:400,opacity:0.8}}>{c.country}</span></div>
                  <div className="ccard-votes">↑ {c.votes}</div>
                </div>
              </div>
              <div className="ccard-body">
                <div className="ccard-author"><div className="ccard-avatar" style={{background:"var(--ocean)"}}>{c.author}</div><span className="ccard-name">@{c.name}</span></div>
                <div className="ccard-meta">{c.meta}</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {c.tags.map(t=><span key={t} className="ctag hi">{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </>}
      {tab==="friends"&&<>
        {FRIENDS_FEED.map((f,i)=>(
          <div key={i} className="ffeed-card">
            <div className="ffeed-header">
              <div className="ffeed-avatar" style={{background:f.color}}>{f.initial}</div>
              <div><div className="ffeed-user">{f.user}</div><div className="ffeed-action">{f.action} <strong>{f.dest}</strong> · {f.time}</div></div>
            </div>
            <div style={{padding:"0 18px 14px",display:"flex",gap:8,alignItems:"center"}}>
              <div style={{width:36,height:36,borderRadius:8,background:"var(--ocean)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.7)",fontFamily:"DM Mono,monospace",flexShrink:0}}>{f.flag}</div>
              <div><div style={{fontSize:13,color:"var(--slate)",marginBottom:4}}>{f.meta}</div><div style={{display:"flex",gap:6}}>{f.tags.map(t=><span key={t} className="ctag hi">{t}</span>)}</div></div>
            </div>
            <div className="ffeed-footer">
              <button className="ffeed-btn">Like · {f.votes}</button>
              <button className="ffeed-btn">Fork trip</button>
              <button className="ffeed-btn">Comment</button>
            </div>
          </div>
        ))}
      </>}
    </div>
  );
}

/* ═══════════ PROFILE VIEW ═══════════════════════════════════════ */
function ProfileView() {
  const [trips,setTrips]=useState(HISTORY_TRIPS.map((t,i)=>({...t,id:i})));
  const [drag,setDrag]=useState(null);
  const handleDragStart=(e,i)=>setDrag(i);
  const handleDragOver=(e,i)=>{e.preventDefault();if(drag===null||drag===i)return;const next=[...trips];const [item]=next.splice(drag,1);next.splice(i,0,item);setTrips(next);setDrag(i);};
  const handleDrop=()=>setDrag(null);
  return (
    <div>
      <div className="profile-map-header">
        <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,var(--deep),var(--ocean))",display:"flex",alignItems:"center",justifyContent:"center"}}></div>
        <div className="profile-overlay">
          <div style={{display:"flex",alignItems:"flex-end",gap:16}}>
            <div className="profile-avatar">A</div>
            <div><div className="profile-name">Alyssa Fletcher</div><div style={{fontSize:12,color:"var(--slate)"}}>@alyssa.t · Member since 2022</div><div className="pstats"><div><div className="pstat-n">12</div><div className="pstat-l">Trips</div></div><div><div className="pstat-n">23</div><div className="pstat-l">Countries</div></div><div><div className="pstat-n">48</div><div className="pstat-l">Days abroad</div></div></div></div>
          </div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>Trip Rankings</div>
        <div style={{fontSize:12,color:"var(--slate)",fontStyle:"italic"}}>Drag to reorder ↕</div>
      </div>
      {trips.map((t,i)=>(
        <div key={t.id} className="hist-row" draggable onDragStart={e=>handleDragStart(e,i)} onDragOver={e=>handleDragOver(e,i)} onDrop={handleDrop} style={{opacity:drag===i?0.5:1,cursor:"grab"}}>
          <span style={{fontSize:22}}>{t.icon}</span>
          <div style={{flex:1}}><div className="hist-dest">{t.dest}</div><div className="hist-meta">{t.meta}</div></div>
          <div className="hist-rank">{["#1 of my life","#2 overall","#3 overall","#4 overall"][i]||`#${i+1}`}</div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════ SIDEBAR PAST TRIPS ═════════════════════════════════ */
function SidebarPastTrips({onSelect}) {
  const past=PAST_TRIPS.filter(t=>t.status==="past");
  const drafts=PAST_TRIPS.filter(t=>t.status==="draft");
  return (
    <>
      {/* Drafts — always visible, no collapse */}
      {drafts.length>0&&<>
        <div className="sb-section">Drafts</div>
        {drafts.map(t=>(
          <button key={t.id} className="sb-item" onClick={()=>onSelect(t.id)}>
            <span className="sb-icon" style={{fontSize:14}}>{t.icon}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.name}</div>
              <div style={{fontSize:10,color:"var(--slate)",marginTop:1}}>{t.note}</div>
            </div>
            <span style={{flexShrink:0,fontSize:9,color:"var(--gold)",fontFamily:"DM Mono,monospace",background:"rgba(201,168,76,0.12)",padding:"2px 7px",borderRadius:100,border:"1px solid rgba(201,168,76,0.2)"}}>draft</span>
          </button>
        ))}
      </>}

      {/* Past trips — collapsible */}
      <div className="sb-section">Past trips</div>
      {past.map(t=>(
        <button key={t.id} className="sb-item" onClick={()=>onSelect(t.id)}>
          <span className="sb-icon" style={{fontSize:14}}>{t.icon}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.name}</div>
            <div style={{fontSize:10,color:"var(--slate)",marginTop:1}}>{t.note}</div>
          </div>
          <span style={{flexShrink:0,fontSize:9,color:"var(--slate)",fontFamily:"DM Mono,monospace"}}>{t.dates}</span>
        </button>
      ))}
    </>
  );
}

/* ═══════════ APP ════════════════════════════════════════════════ */
export default function App() {
  const [showHero,setShowHero]=useState(true);
  const [tab,setTab]=useState("sicily");
  const [globalSavedCount,setGlobalSavedCount]=useState(2); // starts with 2 demo items

  const handleGlobalSave=(item)=>{setGlobalSavedCount(p=>p+1);};
  const inApp=!showHero;

  return (
    <div style={{minHeight:"100vh"}}>
      <style>{S}</style>
      <nav className="nav">
        <div className="nav-logo" onClick={()=>setShowHero(true)} style={{cursor:"pointer"}}>trip<span>craft</span></div>
        <div className="nav-links">
          <button className={`nav-link ${tab==="discover"&&inApp?"active":""}`} onClick={()=>{setShowHero(false);setTab("discover")}}>Discover</button>
<button className={`nav-link ${tab==="profile"&&inApp?"active":""}`} onClick={()=>{setShowHero(false);setTab("profile")}}>Profile</button>
        </div>
        <button className="nav-cta" onClick={()=>{setShowHero(false);setTab("new")}}>+ New trip</button>
      </nav>

      {/* ── Sticky save bar on all in-app pages ── */}
      {inApp && <SaveBar onSaved={handleGlobalSave}/>}

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
                <div className="hero-card-badge">Active · 7 days</div>
                <div className="hero-card-title">Sicily, Italy</div>
                <div className="hero-card-meta">MAY 12–19 · 2 TOTAL TRAVELERS · $3,200 BUDGET</div>
                {HERO_DAYS.map((d,i)=>(
                  <div key={i} className="hday">
                    <div className="hday-num">{d.day}</div>
                    <div style={{flex:1}}><div className="hday-title">{d.title}</div><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{d.items.map((item,j)=><span key={j} className={`hpill ${item.includes("✓")?"done":""}`}>{item}</span>)}</div></div>
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
        <>
        <div className="shell">
          <aside className="sidebar">
            <div className="sb-section">Active</div>
            <button className={`sb-item ${tab==="sicily"?"active":""}`} onClick={()=>setTab("sicily")}>
              <span className="sb-icon" style={{fontSize:14}}>IT</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Sicily, Italy</div>
                <div style={{fontSize:10,color:"var(--slate)",marginTop:1}}>May 12–19 · 7 days</div>
              </div>
              <span style={{flexShrink:0,fontSize:9,color:"#4ade80",fontFamily:"DM Mono,monospace",background:"rgba(74,222,128,0.1)",padding:"2px 7px",borderRadius:100,border:"1px solid rgba(74,222,128,0.25)"}}>● active</span>
            </button>
            <SidebarPastTrips onSelect={setTab}/>

            {/* ── Saved Links sidebar item ── */}
            <div className="sb-section">Capture</div>
            <button className={`sb-item ${tab==="save"?"active":""}`} onClick={()=>setTab("save")}>
              <span className="sb-icon">↗</span>Saved links
              {globalSavedCount>0&&<span style={{marginLeft:"auto",background:tab==="save"?"rgba(196,96,58,0.3)":"rgba(255,255,255,0.08)",color:tab==="save"?"var(--terra-lt)":"rgba(255,255,255,0.4)",borderRadius:100,padding:"1px 7px",fontSize:10,fontFamily:"DM Mono,monospace"}}>{globalSavedCount}</span>}
            </button>

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
            {tab==="save"     && <SaveView/>}
          </div>
        </div>
        {/* ── Mobile bottom navigation (only visible on mobile via CSS) ── */}
        <nav className="mobile-bottom-nav">
          <button className={`mbn-btn ${tab==="sicily"?"active":""}`} onClick={()=>setTab("sicily")}>
            <span className="mbn-icon">IT</span>My Trip
          </button>
          <button className={`mbn-btn ${tab==="discover"?"active":""}`} onClick={()=>setTab("discover")}>
            <span className="mbn-icon">✦</span>Discover
          </button>
          <button className={`mbn-btn ${tab==="new"?"active":""}`} onClick={()=>setTab("new")}>
            <span className="mbn-icon">+</span>New
          </button>
          <button className={`mbn-btn ${tab==="save"?"active":""}`} onClick={()=>setTab("save")}>
            <span className="mbn-icon">↗</span>Saved
          </button>
          <button className={`mbn-btn ${tab==="profile"?"active":""}`} onClick={()=>setTab("profile")}>
            <span className="mbn-icon">◈</span>Profile
          </button>
        </nav>
        </>
      )}
    </div>
  );
}
