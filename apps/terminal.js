export default {
  id: 'terminal',
  name: 'Terminal',
  icon: '›_',
  singleton: false,
  width: 640,
  height: 400,
  mount(root, ctx) {
    root.classList.add('terminal');
    root.style.background = 'rgba(18, 18, 22, 0.96)';

    const out = document.createElement('div');
    out.className = 'terminal-out';

    const input = document.createElement('input');
    input.className = 'terminal-input';
    input.placeholder = 'type a command...';
    input.spellcheck = false;

    root.appendChild(out);
    root.appendChild(input);

    const print = s => {
      out.textContent += s + '\n';
      out.scrollTop = out.scrollHeight;
    };

    print('Drift OS Terminal —type "help" for commands.');

    input.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const cmd = input.value.trim();
      input.value = '';
      if (!cmd) return;
      print('> ' + cmd);
      const [name, ...args] = cmd.split(' ');
      if (name === 'help') print('help  echo  date  clear  about  drift');
      else if (name === 'echo') print(args.join(' '));
      else if (name === 'date') print(new Date().toString());
      else if (name === 'clear') out.textContent = '';
      else if (name === 'about') print('Drift OS v0.2 —a web OS in vanilla JS.');
      else if (name === 'drift') {
        print('');
        print('        ___   __________     __');
        print('      /   | |___  ___  /   / /   🏁 apex now!');
        print('     / /| |    / /  / /   / /');
        print('    / ___ |   / /  / /___/ /___  *snoooort*');
        print('   /_/  |_|  /_/  /_____/|_____|');
        print('');
        print('  best way to earn points → open Drift Score from the Dock');
        print('  or right-click the desktop for drift wallpapers.');
        print('');
      }
      else print('command not found: ' + name);
    });

    root.addEventListener('mousedown', () => {
      setTimeout(() => input.focus(), 0);
    });

    setTimeout(() => input.focus(), 50);
  }
};
