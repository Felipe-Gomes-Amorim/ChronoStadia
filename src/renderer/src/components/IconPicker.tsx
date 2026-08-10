import bookIcon       from '../assets/icons/32x32/book.png'
import checkmarkIcon  from '../assets/icons/32x32/checkmark.png'
import clockIcon      from '../assets/icons/32x32/clock.png'
import coinsIcon      from '../assets/icons/32x32/coins.png'
import heartIcon      from '../assets/icons/32x32/heart.png'
import interactIcon   from '../assets/icons/32x32/interact.png'
import inventoryIcon  from '../assets/icons/32x32/inventory.png'
import mapIcon        from '../assets/icons/32x32/map.png'
import musicIcon      from '../assets/icons/32x32/music.png'
import pencilIcon     from '../assets/icons/32x32/pencil.png'
import potionIcon     from '../assets/icons/32x32/potion.png'
import shieldIcon     from '../assets/icons/32x32/shield.png'
import starIcon       from '../assets/icons/32x32/star.png'
import swordIcon      from '../assets/icons/32x32/sword.png'
import toolsIcon      from '../assets/icons/32x32/tools.png'
import worldIcon      from '../assets/icons/32x32/world.png'

export const ICON_OPTIONS: Array<{ src: string; label: string }> = [
  { src: starIcon,      label: 'Favorito'      },
  { src: heartIcon,     label: 'Saúde'         },
  { src: swordIcon,     label: 'Treino'        },
  { src: shieldIcon,    label: 'Disciplina'    },
  { src: clockIcon,     label: 'Horário'       },
  { src: bookIcon,      label: 'Estudo'        },
  { src: pencilIcon,    label: 'Escrita'       },
  { src: musicIcon,     label: 'Criatividade'  },
  { src: coinsIcon,     label: 'Finanças'      },
  { src: potionIcon,    label: 'Bem-estar'     },
  { src: toolsIcon,     label: 'Trabalho'      },
  { src: checkmarkIcon, label: 'Meta'          },
  { src: mapIcon,       label: 'Planejamento'  },
  { src: inventoryIcon, label: 'Inventário'    },
  { src: interactIcon,  label: 'Social'        },
  { src: worldIcon,     label: 'Global'        },
]

interface IconPickerProps {
  value: string
  onChange: (glyph: string) => void
}

function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="icon-picker">
      {ICON_OPTIONS.map((option) => (
        <button
          key={option.src}
          type="button"
          className={`icon-option${value === option.src ? ' selected' : ''}`}
          aria-pressed={value === option.src}
          onClick={() => onChange(option.src)}
          title={option.label}
        >
          <img src={option.src} width={24} height={24} alt={option.label} className="pixel-icon" />
        </button>
      ))}
    </div>
  )
}

export default IconPicker
