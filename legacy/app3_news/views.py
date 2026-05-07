from django.shortcuts import render
from django.http import HttpResponse, HttpResponseNotFound
from django.template import loader
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q
from django.templatetags.static import static
import calendar
from datetime import datetime
from .models import Event, Post, PostFile
from .forms import PostForm, FileForm


def event(request): 
    
    now = datetime.now()
    year = now.year
    month = now.month
    month_name = now.strftime('%B') 

    calendar.setfirstweekday(calendar.MONDAY)
    cal = calendar.monthcalendar(year, month)
    events = Event.objects.all() 

    context = {
        'month_name': month_name,
        'cal': cal,
        'year': year,
        'month': month,
        'events': events,
    }

    return render(request, 'event.html', context)

# announcement start
def announcement(request):
    query = request.GET.get('q') 

    if query:
        posts = Post.objects.filter(
            Q(postname__icontains=query),
            category='announcement' 
        ).order_by('-date')
    else:
        posts = Post.objects.filter(category='announcement').order_by('-date')
        
    paginator = Paginator(posts, 10) 
    page = request.GET.get('page')


    page = request.GET.get('page')
    try:
        page_obj = paginator.page(page)
    except PageNotAnInteger:
        page_obj = paginator.page(1)
    except EmptyPage:
        page_obj = paginator.page(paginator.num_pages)

    total_count = posts.count()
    start_index = page_obj.start_index()

    numbered_posts = []
    for i, post in enumerate(page_obj):
        number = total_count - (start_index - 1 + i)
        numbered_posts.append((number, post))

    col_head = ["No.", "Title", "Writer", "Date"]  

    context = {
        'page_obj': page_obj,
        'col_head': col_head,
        'numbered_posts': numbered_posts,
        'query': query
    }

    return render(request, 'announcement.html', context)

# Detail view for a specific announcement
def announcement_detail(request, id):
    post = get_object_or_404(Post, pk=id, category='announcement' )
    
    previous_post = Post.objects.filter(id__lt=post.id, category='announcement').order_by('-id').first()
    next_post = Post.objects.filter(id__gt=post.id, category='announcement').order_by('id').first()

    return render(request, 'announcement_detail.html', {
        'post': post,
        'previous_post': previous_post,
        'next_post': next_post,
    })

@login_required(login_url='/login/')
def announcement_create(request):
    if not (request.user.is_superuser or request.user.is_staff):
        messages.error(request, "You don't have permission to access", extra_tags='app3')
        return redirect('news:announcement')  

    if request.method == 'POST':
        post_form = PostForm(request.POST)
        file_form = FileForm(request.POST, request.FILES)

        if post_form.is_valid():
            post = post_form.save(commit=False)
            post.author = request.user
            post.category = 'announcement'
            post.save()

            files = request.FILES.getlist('files')
            for f in files:
                PostFile.objects.create(post=post, file=f)

            return redirect('news:announcement')
    else:
        post_form = PostForm()
        file_form = FileForm()

    return render(request, 'announcement_form.html', {
        'post_form': post_form,
        'file_form': file_form,
    })


# Revise posts
@login_required(login_url='/login/')
def announcement_edit(request, id):
    post = get_object_or_404(Post, pk=id, category='announcement' )

    if post.author != request.user:
        messages.error(request, "You don't have authority to revise.", extra_tags='app3')
        return redirect('news:announcement_detail', id=post.id)

    if request.method == 'POST':
        post_form  = PostForm(request.POST, instance=post)

        
        if post_form.is_valid():
            updated_post = post_form.save()

            for f in request.FILES.getlist('files'):
                PostFile.objects.create(post=updated_post, file=f)

            delete_ids = request.POST.getlist('delete_files')
            if delete_ids:
                PostFile.objects.filter(id__in=delete_ids, post=post).delete()

            messages.success(request, "Successfully modified.", extra_tags='app3')
            return redirect('news:announcement_detail', id=post.id)
    else:
        post_form = PostForm(instance=post)

    return render(request, 'announcement_form.html', {
        'post_form': post_form, 
        'file_form': FileForm(), 
        'existing_files': post.files.all(),
    })

@login_required(login_url='/login/')
def announcement_delete(request, id):
    post = get_object_or_404(Post, pk=id,category='announcement' )

    if post.author != request.user:
        messages.error(request, "You don't have authority to delete.", extra_tags='app3')
        return redirect('news:announcement_detail', id=post.id)

    if request.method == 'POST':
        post.delete()
        messages.success(request, "Your post is deleted.", extra_tags='app3')
        return redirect('news:announcement')

    return render(request, 'announcement_confirm_delete.html', {'post': post})



