const taskModal=document.querySelector('#task-modal');
const taskForm=document.querySelector('#task-form');
const taskList=document.querySelector('#task-list');

document.querySelectorAll('#task-filter-priority, #task-form select[name="priority"]').forEach(select=>{const option=document.createElement('option');option.textContent='Extrema';option.value='Extrema';select.insertBefore(option,select.options[1]||null)});

function openTaskModal(){taskModal.classList.add('open');taskModal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';setTimeout(()=>taskForm.querySelector('select').focus(),50)}
function closeTaskModal(){taskModal.classList.remove('open');taskModal.setAttribute('aria-hidden','true');document.body.style.overflow='';taskForm.reset();taskForm.querySelector('.task-error').classList.remove('show')}
document.querySelector('#open-task-modal').addEventListener('click',openTaskModal);
document.querySelectorAll('[data-close-task]').forEach(button=>button.addEventListener('click',closeTaskModal));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&taskModal.classList.contains('open'))closeTaskModal()});

function filters(){return new URLSearchParams({category:document.querySelector('#task-filter-category').value,status:document.querySelector('#task-filter-status').value,priority:document.querySelector('#task-filter-priority').value})}
async function loadTasks(){
  taskList.innerHTML='<div class="empty"><b>Carregando tarefas...</b></div>';
  try{
    const {tasks,counts}=await api(`/api/staff/tasks?${filters()}`);
    document.querySelector('#tasks-total').textContent=counts.total;document.querySelector('#tasks-pending').textContent=counts.pending;document.querySelector('#tasks-completed').textContent=counts.completed;
    taskList.innerHTML=tasks.length?tasks.map(taskCard).join(''):'<div class="empty"><i>▣</i><b>Nenhuma tarefa encontrada</b><span>Crie uma tarefa ou altere os filtros.</span></div>';
    taskList.querySelectorAll('[data-complete-task]').forEach(button=>button.addEventListener('click',()=>changeTask(button.dataset.completeTask,'complete')));
    taskList.querySelectorAll('[data-reopen-task]').forEach(button=>button.addEventListener('click',()=>changeTask(button.dataset.reopenTask,'reopen')));
    taskList.querySelectorAll('[data-delete-task]').forEach(button=>button.addEventListener('click',()=>removeTask(button.dataset.deleteTask)));
  }catch(error){taskList.innerHTML=`<div class="empty"><b>${escapeHtml(error.message)}</b></div>`}
}

function taskCard(task){
  const completed=task.status==='Concluída';
  const priorityClass=['Extrema','Urgente'].includes(task.priority)?'extreme':String(task.priority).toLowerCase();
  return `<article class="task-card ${completed?'completed':''}"><h3>${escapeHtml(task.title)}</h3><div class="task-meta"><span class="category">${escapeHtml(task.category)}</span><span class="${priorityClass}">${escapeHtml(task.priority)}</span><span class="status ${completed?'done':'pending'}">${escapeHtml(task.status)}</span></div><div class="task-details"><p>Criado por: <b>${escapeHtml(task.creator_name)}</b></p><p>Criado em: ${new Date(task.created_at).toLocaleString('pt-BR')}</p><p>Descrição: ${escapeHtml(task.description)}</p>${task.coordinates?`<p>Coordenadas: ${escapeHtml(task.coordinates)}</p>`:''}${completed?`<p>Concluído por: ${escapeHtml(task.completed_by_name||'Staff')}</p><p>Concluído em: ${new Date(task.completed_at).toLocaleString('pt-BR')}</p>`:''}</div>${task.image_url?`<a class="task-image" href="${escapeAttribute(task.image_url)}" target="_blank" rel="noopener">Ver foto ↗</a>`:''}<div class="task-buttons">${completed?`<button data-reopen-task="${task.id}">↶ Voltar para pendente</button>`:`<button class="complete" data-complete-task="${task.id}">✓ Marcar como concluída</button>`}<button class="remove" data-delete-task="${task.id}">▣ Excluir</button></div></article>`
}
async function changeTask(id,action){try{await api(`/api/staff/tasks/${id}/${action}`,{method:'PATCH'});toast(action==='complete'?'Tarefa concluída':'Tarefa voltou para pendente');await loadTasks()}catch(error){toast(error.message)}}
async function removeTask(id){if(!confirm('Deseja realmente excluir esta tarefa?'))return;try{await api(`/api/staff/tasks/${id}`,{method:'DELETE'});toast('Tarefa excluída');await loadTasks()}catch(error){toast(error.message)}}

taskForm.addEventListener('submit',async event=>{event.preventDefault();const errorBox=taskForm.querySelector('.task-error');const submit=taskForm.querySelector('[type="submit"]');errorBox.classList.remove('show');submit.disabled=true;submit.textContent='Salvando...';try{const body=Object.fromEntries(new FormData(taskForm));await api('/api/staff/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});closeTaskModal();toast('Tarefa criada com sucesso');await loadTasks()}catch(error){errorBox.textContent=error.message;errorBox.classList.add('show')}finally{submit.disabled=false;submit.textContent='Salvar tarefa'}});
document.querySelectorAll('#task-filter-category,#task-filter-status,#task-filter-priority').forEach(select=>select.addEventListener('change',loadTasks));
loadTasks();
