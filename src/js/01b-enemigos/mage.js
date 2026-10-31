defEnemy('mage', {
  orden: 8,
  stats: { hp: 8, r: 12, speed: 70, dmg: 1, spr: 'mage', s: 2 },
  bestiario: { n: 'Mago', d: 'Se teletransporta si te acercas y lanza runas bajo tus pies.' },
  sprite: {
    clave: 'mage',
    mapa: ['....kkkk....', '...kppppk...', '..kppppppk..', '..kpkkkkpk..', '..kpkgkgpk..', '..kppkkppk..', '..kppppppk..',
      '.kppppppppk.', '.kppbppbppk.', '.kppppppppk.', 'kppppppppppk', 'kppppppppppk', '.kkkkkkkkkk.'],
    paleta: { k: '#0f0a14', p: '#4a2f6a', g: '#9bff7a', b: '#9bff7a' }
  },
  esquiva: true,
  // usa la misma IA que 'archer'
  ia: 'archer',
  encima(e, la, white) { ctx.fillStyle = e.aiming ? '#ffffff' : '#9bff7a'; ctx.beginPath(); ctx.arc(e.x + (Math.cos(la) < 0 ? -13 : 13), e.y - 6 + Math.sin(e.t * 4) * 2, e.aiming ? 5 : 3.5, 0, TAU); ctx.fill(); }
});
